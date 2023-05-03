import React, { useEffect, useState } from 'react';
import AuthForm from './Auth';
import axios from 'axios';
import hmacSHA256 from 'crypto-js/hmac-sha256';
import encHex from 'crypto-js/enc-hex';
import encBase64 from 'crypto-js/enc-base64';
import Utf8 from 'crypto-js/enc-utf8';
import { Document, Page, Text, StyleSheet, pdf, Image } from '@react-pdf/renderer';
import QRCode from 'qrcode';
import { GoogleReCaptcha, GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
interface LoginFormProps {
  onLoginSuccess: () => void;
}

const App: React.FC = () => {

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setLoginResponse(token);
    }
  }, []);

  const [username, setUsername] = useState<string>('test');
  const [password, setPassword] = useState<string>('test');
  const [loginResponse, setLoginResponse] = useState('');
  const [postInvoiceResponse, setPostInvoiceinResponse] = useState('');
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [shortLinkValue, setShortLinkValue] = useState('https://www.google.com');
  const [fullLinkValue, setFullLinkValue] = useState('');
  const secret = '1'; //should be ramdomly generated
  const host = 'https://hwoo73zvog.execute-api.us-east-1.amazonaws.com/Invoices-test';
  const siteKey = '6Ldj-9clAAAAABJduSX_hWq0Ixvy9EIiO9dk3UXd';
  const [isVerified, setIsVerified] = useState(false);
  // invoice
  const [invoiceJSONString, setInvoiceJsonStr] = useState<string>(`{
    "orders": [
      {
        "duck": "10"
      },
      {
        "chicken": "10"
      }
    ],
    "orderRefference": "NF",
    "address": "123 Melbourne st",
    "phone": "123456789",
    "restaraunt": "Melbourne best dumplings",
    "merchantId": 1,
    "type": "pickup"
  }`);



  const hashStringWithHmac = (secret: string, data: string): string => {
    const hash = hmacSHA256(data, secret);
    const digest = hash.toString(encHex);
    return digest;
  }
  const encodeBase64 = (data: string): string => {
    const encoded = encBase64.stringify(Utf8.parse(data));
    return encoded;
  }


  const handleUsernameChange = (value: string) => {
    setUsername(value);
  }

  const handlePasswordChange = (value: string) => {
    setPassword(value);
  }

  const handleJsonStrChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInvoiceJsonStr(event.target.value);
  };

  const handleOrderNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOrderNumber(event.target.value);
  };

  const handleShortLinkChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    setShortLinkValue(event.target.value);
  };
  const handleFullLinkChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    setFullLinkValue(event.target.value);
  };
  const handleLoginClick = async () => {
    try {
      const hashData = hashStringWithHmac(secret, password);
      const base64PlainData = username + ":" + hashData;
      const base64Data = encodeBase64(base64PlainData);
      let config = {
        method: 'post',
        url: host + '/auth',
        headers: {
          'key': secret,
          'Authorization': 'Basic ' + base64Data,
        }
      };

      axios.request(config)
        .then((response) => {
          var message = JSON.parse(response.data.message);
          localStorage.setItem('token', (message.token));
          setLoginResponse(JSON.stringify((message.token)));
        })
        .catch((error) => {
          console.log(error);
          setLoginResponse(JSON.stringify(error));
        });

    } catch (error) {
      console.error(error);
    }
  }

  const handlePostInvoiceClick = async () => {
    try {

      var data = JSON.parse(invoiceJSONString);
      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: host + '/invoice',
        headers: {
          'Authorization': localStorage.getItem('token'),
          'Content-Type': 'text/plain'
        },
        data: data
      };
      axios.request(config)
        .then((response) => {
          var message = JSON.parse(response.data.message);
          var orderNumber = JSON.stringify(message.orderNumber);
          // convert to string
          // please remove the double quote
          orderNumber = orderNumber.replace(/"/g, "");
          setPostInvoiceinResponse("orderNumber:" + orderNumber);
          setOrderNumber(orderNumber);
        })
        .catch((error) => {
          console.log(error);
        });


      console.log(invoiceJSONString);
    } catch (error) {
      console.error(error);
    }
  }

  const handleGetInvoiceClick = async () => {
    try {
      let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `${host}/invoice?orderNumber=${orderNumber}`,
        headers: {}
      };

      axios.request(config)
        .then(async (response) => {
          var invoice = JSON.parse(response.data.message);
          console.log(JSON.stringify(invoice));
          const pdfContent = generatePdfContent(invoice);
          let blobPDF = pdf(await pdfContent).toBlob();
          const url = URL.createObjectURL(await blobPDF);
          window.open(url, '_blank');
        })
        .catch((error) => {
          console.log(error);
        });
    } catch (error) {
      console.error(error);
    }
  }


  const handleGetShortLinkClick = async () => {
    try {
      let data = `{"fullLink":"${shortLinkValue}"}`;

      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `${host}/s/`,
        headers: {
          'Authorization': localStorage.getItem('token'),
          'Content-Type': 'text/plain'
        },
        data: data
      };
      axios.request(config)
        .then((response) => {

          var link = JSON.parse(response.data.message);
          console.log(JSON.stringify(link.shortLink));
          setFullLinkValue(host + "/s/" + link.shortLink);
        })
        .catch((error) => {
          console.log(error);
        });
    } catch (error) {
      console.error(error);
    }
  }

  const handleVerify = (token: any) => {
    if (token) {
      setIsVerified(true);
    }
  };
  const styles = StyleSheet.create({
    page: {
      backgroundColor: '#fff',
    },
    section: {
      margin: 10,
      padding: 10,
      flexGrow: 1,
    },
    view: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "center",
      width: "100%"
    },
    text: {
      marginTop: 10,
      fontSize: 8,
      textAlign: 'center',
    },
  });
  const generatePdfContent = async (invoice: any): Promise<any> => {

    const dataUrl = await QRCode.toDataURL("123");

    return (
      <Document>
        <Page>
          <Text>Invoice Details</Text>
          <Text>OrderRef: {invoice.orderRefference}</Text>
          <Text>Orders: {JSON.stringify(invoice.orders)}</Text>



          <Text>Address: {invoice.address}</Text>
          <Text>Phone: {invoice.phone}</Text>
          <Text>Restaraunt: {invoice.restaraunt}</Text>
          <Text>Merchant Id: {invoice.merchantId}</Text>
          <Text>Type: {invoice.type}</Text>
          <Text>QR Code:</Text>
          <Image src={dataUrl} style={{ width: '50%', margin: '0 auto', }} />
        </Page>
      </Document>
    )
  };


  return (
    <div>
      <AuthForm username={username} password={password} onUsernameChange={handleUsernameChange} onPasswordChange={handlePasswordChange} />
      <button onClick={handleLoginClick}>Login</button>
      <label>{loginResponse}</label>
      <br />
      <textarea value={invoiceJSONString} onChange={handleJsonStrChange} style={{ width: '600px', height: '400px' }} />
      <br />
      <button onClick={handlePostInvoiceClick}>Post Invoice</button>
      <label>{postInvoiceResponse}</label>
      <br />
      <label>Order Number</label>
      <input type="text" id="orderNumber" value={orderNumber} onChange={handleOrderNumberChange} />
      <button onClick={handleGetInvoiceClick}>Get Invoice</button>
      <br />
      <br />
      <GoogleReCaptchaProvider reCaptchaKey="6Ldj-9clAAAAABJduSX_hWq0Ixvy9EIiO9dk3UXd">
        <GoogleReCaptcha onVerify={handleVerify} />
      </GoogleReCaptchaProvider>
      {isVerified && <p>reCAPTCHA verified!</p>}
      <label htmlFor="inputField"> shortLink generator:</label>
      <input type="text" value={shortLinkValue} onChange={handleShortLinkChange} />
      <button onClick={handleGetShortLinkClick}>Get short Link</button>
      <br />
      <a href={fullLinkValue}>{fullLinkValue}</a>


    </div>
  );
}

export default App;