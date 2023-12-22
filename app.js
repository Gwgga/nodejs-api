const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Api Server Fl0');
})

app.post('/pushover/avizz', (req, res) => {
    const data = req.body;

    if (data) {
        let paymentMethod;

        switch (data.paymentMethod) {
            case 'PIX':
                paymentMethod = 'Pix';
                break;
            case 'BILLET':
                paymentMethod = 'Boleto';
                break;
            case 'CREDIT_CARD':
                paymentMethod = 'Cartão de Crédito';
                break;
            default:
                paymentMethod = null;
        }

        const price = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(data.price);

        let messageNotification;

        if (['PIX', 'BILLET'].includes(data.paymentMethod)) {
            messageNotification = data.status === 'WAITING_PAYMENT'
                ? `Novo pedido de ${paymentMethod} aguardando pagamento no valor de ${price}.`
                : `Pedido de ${paymentMethod} pago no valor de ${price}.`;
        } else {
            messageNotification = data.checkout.isUpsell
                ? `Novo pedido de Upsell recebido no valor de ${price}.`
                : `Novo pedido de ${paymentMethod} recebido no valor de ${price}.`;
        }

        if (messageNotification) {
            axios.post('https://api.pushover.net/1/messages.json', {
                token: 'a899ac354b6v5yb1iiohikitactc9e',
                user: 'us3hhoeitd8vsx5y5bes31myvok6in',
                title: 'Avizz',
                message: messageNotification,
            })
                .then(response => {
                    console.log(response.data);
                    res.status(200).send(response.data);
                })
                .catch(error => {
                    console.error(error);
                    res.status(500).send('Internal Server Error');
                });
        }
    } else {
        res.status(400).send('No JSON data received');
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
