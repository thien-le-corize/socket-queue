import admin from 'firebase-admin'

export const serviceAccountPrivate: any = {
    type: 'service_account',
    project_id: 'api-web-diff',
    private_key_id: '56dde8a02a1929258ee732a0ee36ca8af454c238',
    private_key:
        '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCryDxivCVY2vMW\nFsdxrMEGUQFiNUpxdkUnglNbgwIjg1+tlX31Asy33Qw5eJhnIBD/iZlurWMZG9pK\njgqt0s7/215zNrpU23eh/k/FsZttz8atcFdmd2JL0HDg4/JGOlUyIdtaqGDEwe6L\nl5nOSis5Op0pcLu1o6C253yeCSGNhgSBwF0euYtUPL9o7MnSjO1niBuL0Wa2g3wR\nCq3/XHNlRNSaA2DG0czckaM1+v8Mw8wX7ncEuimes/ttKoQj50zxcxYmJwhQzJ0f\nlXFqyUqsxw+El/S3vS9TeGrJwE+4GVoEvm+OaG0vC1OYAlzP+X06NTdh0sRRSbRj\nzuHxTsZdAgMBAAECggEACmpGCwB4TTZdNbIk3oYIX/8qU8+CV3XBxJ74udwsFYYi\nF26wZ9oHGoC6/IMMznfZv/ySQm0dzIhtSEbra9WTulyNEfQ4AOwbiUVXhdd6YoKN\n+7cLfYlwesNFDMWVS1+/CZ6W45zA3T0a3vjOmPzTORGONNSCdQVaOay4WAaas69a\nYuxddg637Shr0X9dXdkvmSEKGcPyiQIqPT8up6+jBTKXZ7AM79dmY8YGvLIilFKX\n3nXsW2PPusu2S086Zxu1p5Ep1c4JUvY8mZmDJhpq+/hX2CYc9BEpVfFmZydjvBdC\nIwJpUH+DlQNdJCUec+NtVRgHrLjMVscLpute9RLKAQKBgQDp4xoX6FvRMpWuvHSo\nO7O3QfgU/j4RSRtUnwbGarLNJWG6HQHA65mF2A7BURb7n8PBISemyBZTfZdbSXa9\nLwSnoFFzGbS208kFVPqsJdxAxQPpXuqx8h/f9veUbn2+tYpCLjtOk4f9giuE+Jam\nP16K/aboTSFtmilgDbI5X7NBXQKBgQC8BflS8LWKuKWNeUU15vW5TKkrYrJFfA0S\nIDK/zj3RXJ1CF8Mv0zWOfO4vQaQuTfev7OaF7ryyjw9ZCwZ8z9Up47bS0rp30oln\nSd9egEI8z0qNz3n4caiwBu3jwPick2xR90UpXH6RFC+ne51pgokmdAEJKVfgzzJ4\nWm1ULFhJAQKBgQDWAk6694skRZP++kQIN/C+y6czllu2t11Bte2eGr2WxxDAGpCj\nNTEZ7lO6Aff0sACPtEWy7zy2kqGvDu6ONvqcYy6EEk5wSCOVNGfWoyIBRgTJQmeg\nAXu3FCUAdYWrvjNPUTxFLuttRPGLT2eRoURiC6zwvLrMrhYT5RRiOTYtpQKBgQC7\n1vgDnUiwwtFZ6hpzxD4elfC30E0rT8g7IIGyz1dAztaojdbI86egpzzJZzmfrPLT\nBcgza5OGi5eYrIQZswRRahZevnnddS8iSlHmNhp2Z90imXFP/DS7TuDgVQvKWRmx\nNWgZ7zbet5z4JG3ZV7iu+tuCDJSnmjfgtu5cVkUJAQKBgHUd4i9Mg2p4hldnJqoy\nS1lyixZGZbNTP0jXS9ajB4aQ/HjW6dorOJcpeda1rdU/D/bDWCTx2rQr6lyZPFY1\nf3wYeuEq5ZdVNFIM4aiIHp5746OxLcLUJyfCgiStlTr00owyqz7kE1WkKdlkmihx\npmSb6bdpaNbfJRaDhMyZVbvd\n-----END PRIVATE KEY-----\n',
    client_email:
        'firebase-adminsdk-c19u5@api-web-diff.iam.gserviceaccount.com',
    client_id: '105190847096626992189',
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url:
        'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-c19u5%40api-web-diff.iam.gserviceaccount.com',
    universe_domain: 'googleapis.com',
}

export const initFirebaseAdmin = () => {
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccountPrivate),
        })
    }
}
