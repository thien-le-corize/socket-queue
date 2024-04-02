import { initializeApp } from 'firebase/app'

import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

export const firebaseConfig = {
    apiKey: 'AIzaSyB3kBuni68qSvG9JQYIMi8mkIQckBiUuyI',
    authDomain: 'api-web-diff.firebaseapp.com',
    projectId: 'api-web-diff',
    storageBucket: 'api-web-diff.appspot.com',
    messagingSenderId: '996872076516',
    appId: '1:996872076516:web:da026d4c574f9ddd5c00f1',
}

const app = initializeApp(firebaseConfig)

const db = getFirestore(app)

export const serviceAccountPrivate: any = {
    type: 'service_account',
    project_id: 'api-web-diff',
    private_key_id: '5f303cfc9912916ded4064b1da261b081060ea01',
    private_key:
        '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC5Xmu84SH1HrIn\nvlzalZyt3urniosodZBFlNHGnZz/+Y7kdmbbwlkQ07H/m8N+ZK2vvdI3sAl3OdVw\nxeEh6Wz0mJvqkd7hoOZVA5VJ1zBKUE5Y/+3hhoZ9O3Zwn/0K9mT9J3t8XJkfyJA1\nnIMr37GLGHn5ua6KO1u1nhtxVuQYLLjEMpbh6UyC/gQFenJ4XjeDFgvXy6Xy9KN0\ni4GJCl5sGGyYwnOrTdd7GS7SWY8rLnE3ZH+rC7+fI919/EsQUjAc2PnG2eqFUBCO\nYhOtKfXT0ZVlFhrsMV2qXoYOZiuiaADngHYWvAFly4cMg0GuVl8z6sWDHHqp0Rsh\nhFpKF+O1AgMBAAECggEATlJNTkSHbwS1vKIrpHXDehlugj9g9cralvO+wN82h1c/\n31sBscfHjxsLIdeD/cL3OgKHsFzSWwxWGSyap5Pzo9NZSX6xv/6WY4Q8jzL7ZeLR\nf7w/G+OVrpMxw3tt1LRvziDhBZYwYqQA/o3vRFnjL8S7QN8KFsDmynGP4c8XV/jR\nRGoJzeV11Gw9eAKziNopcZaQKpaCXM2Lcg3r3FgGFG1hiC4h5ePPshBXVVLpPpSV\nUtk0hdQ84Gkx7cZL3PgaOxp6kREY/NZ1BWnC5ovMpsWIDTT5LkmY5CNeuITuoHup\n3hFFtUD0+0Od/fufLRXkxhjKbVPVsuLP1UVk3/kKHwKBgQDe422nn5WXKpeV+VQN\nGLRBDMzO+dZllqjHjpzHxfCY9IubUJT/0cxb6FEht7aQjD2WgT9z8qQy9ixz44yE\nqmC7fl6qw4RQl9/rJoIBmVd8tgqdoM9TH2NdwgctjI9JffonDS0CsYffU2RePgFw\nfLTwyRIYAX2cj3gPxUFz7yyAxwKBgQDU6Bo2qfA79Ex4hRB8HIPr14CYQe6tuy8J\nBbfdxhQh8OfSTr1xhQlWgHsEjQTPq4LVpCdRDtDHgN2Krq0z0yQx9KrbgUYF2tLc\nhgxqjLjw6ujGJEbejLcnShBFZz/MqFgRAIVGPzR5FZBZLQN33vTDSqeQLz/YxDiK\nmDfN7lPzowKBgCyrC3jCZKpM4OAvfYa6YrV+qTT5oNvvG5gSnpzysEsXBztzJMk3\n9Gqe3lORi8bgNB+Le3nzMLD94N7AxZJ4yrYIl1RFpqi4JynrJ7bGUmAt42a/qY0R\nB0rs7Z9VQgoKcy2MWG7nwUEiZ0TzzDoM4/41bajd85yCrB8M+xcO4a5VAoGAO9mP\nXOSCsufnA04spycA8rBe5u5J4S6odznTSRWgnTXyhQ07dgj26gkuC8Z0nshQ/Cus\nHb4zdJHGNXELIXFuUFi+GvyJKaYs9m78WIt8hcUTcHfMME2QQwwv7MKsjaSZNRZX\nYLrtzkgAjwD3Y6AaYDfBSOfvY8ktN9C4hzxC/08CgYEAhtnUvoIrjDePABZBHCbp\nYsBsIFkj7rypwsS9oEF+mSmlLpIs2RfZU6+MkjnqRbmpl0gYWC9zu0lgDsDxKTct\nriVXHJVE+vEJnVB4I8A6abIT3+vAqZD++v0w4lzqPpna4sO7fjIXXTXMnSDhMRfi\nuO3WfyDY++RIoqQ+mSRoqPU=\n-----END PRIVATE KEY-----\n',
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
export const auth = getAuth(app)
export const storage = getStorage(app)
export default db
