// Definizione dei tipi per le chiavi API e il gateway IPFS
export const pinatakey: string = '4f7b03e4293b351b362b';
export const pinatasecret: string = 'f2c593c26b1772edd1b34bbe3c85c630fbdc4ded6df735a9e25588f57217193e';
export const pinatajwt: string = 'YB4i1-oPrpLj6PSJXzkX4TdObAqyNWA1itABeaxbgcOIGM7v9ltHlQ_izjoZH366';
export const ipfsgateway: string = 'fuchsia-select-junglefowl-195';

// Interfaccia per l'header di lettura
export const readHeader: { "Content-Type": string } = {
    "Content-Type": "application/json",
};

// Definizione delle interfacce per gli headers delle richieste
interface Headers {
    'Content-Type'?: string;
    pinata_api_key?: string;
    pinata_secret_api_key?: string;
}

interface GetHeader {
    headers: Headers;
}

interface SendJsonHeader {
    headers: Headers;
}

// Oggetti con le intestazioni per GET e l'invio di JSON, tipizzati con le interfacce definite
export const getHeader: GetHeader = {
    headers: {
        pinata_api_key: pinatakey,
        pinata_secret_api_key: pinatasecret,
    }
};

export const sendJsonHeader: SendJsonHeader = {
    headers: {
        'Content-Type': 'application/json',
        pinata_api_key: pinatakey,
        pinata_secret_api_key: pinatasecret,
    }
};
