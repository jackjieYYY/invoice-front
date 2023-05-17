import React from 'react';
import axios from 'axios';
import hmacSHA256 from 'crypto-js/hmac-sha256';
import encHex from 'crypto-js/enc-hex';
import encBase64 from 'crypto-js/enc-base64';
import Utf8 from 'crypto-js/enc-utf8';
import { Document, Page, Text, StyleSheet, pdf, Image, View } from '@react-pdf/renderer';
import QRCode from 'qrcode';
import { GoogleReCaptcha, GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import invoice from './invoice';
import { SourceObject } from '@react-pdf/types';
class App extends React.Component {
  token: string = "";
  host: string = "https://hwoo73zvog.execute-api.us-east-1.amazonaws.com/Invoices-test";
  username: string = "test";
  password: string = "test";
  secret: string = "1"; //should be ramdomly generated

  // invoice
  orderNumber: string = "";

  // reCaptcha
  isVerified: boolean = false;
  reCaptchaToken: string = "";

  async componentDidMount() {

    await this.login();
    await this.postInvoice();
    await this.getInvoice();
  }
  constructor(props: any) {
    super(props);
    this.handleVerify = this.handleVerify.bind(this);
  }

  notify = (string: string) => toast(string);
  async login() {
    try {
      console.log("login");
      this.notify("Start to Login");
      const hashData = this.hashStringWithHmac(this.secret, this.password);
      const base64PlainData = this.username + ":" + hashData;
      const base64Data = this.encodeBase64(base64PlainData);

      let config = {
        method: 'post',
        url: this.host + '/auth',
        headers: {
          'key': this.secret,
          'Authorization': 'Basic ' + base64Data,
        }
      };

      await axios.request(config)
        .then((response) => {
          var message = JSON.parse(response.data.message);
          localStorage.setItem('token', (message.token));
          this.token = message.token;
          this.notify("Login Success");
        })
        .catch((error) => {
          console.log(error);
          this.notify("Login Failed");
        });

    } catch (error) {
      console.error(error);
    }
  }
  hashStringWithHmac = (secret: string, data: string): string => {
    const hash = hmacSHA256(data, secret);
    const digest = hash.toString(encHex);
    return digest;
  }
  encodeBase64 = (data: string): string => {
    const encoded = encBase64.stringify(Utf8.parse(data));
    return encoded;
  }

  async postInvoice() {
    try {
      this.notify("Start to Post Invoice");
      var jsonObj = new invoice().invoiceJSON;
      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: this.host + '/invoice',
        headers: {
          'Authorization': localStorage.getItem('token'),
          'Content-Type': 'text/plain'
        },
        data: jsonObj
      };
      await axios.request(config)
        .then((response) => {
          var message = JSON.parse(response.data.message);
          var orderNumber = JSON.stringify(message.orderNumber);
          // convert to string
          // please remove the double quote
          orderNumber = orderNumber.replace(/"/g, "");
          this.orderNumber = orderNumber;
          this.notify("Post Invoice Success");
          this.notify("Order Number: " + orderNumber);
        })
        .catch((error) => {
          console.log(error);
          this.notify("Post Invoice Failed");
        });
    } catch (error) {
      console.error(error);
    }
  }

  async getInvoice() {
    try {
      let config = {
        method: 'get',
        maxBodyLength: Infinity,
        // add orderNumber to the end of the url
        // add reCaptchaToken to the end of the url
        url: `${this.host}/invoice?orderNumber=${this.orderNumber}&reCaptchaToken=${this.reCaptchaToken}`,
        headers: {}
      };

      await axios.request(config)
        .then(async (response) => {
          var invoice = JSON.parse(response.data.message);
          console.log(JSON.stringify(invoice));
          const pdfContent = this.generatePdfContent(invoice);
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
  handleVerify(token: any) {
    console.log(token)
    if (token) {
      this.isVerified = true;
      this.reCaptchaToken = token;
    }
  };




  async generatePdfContent(invoiceData: any): Promise<any> {
    // Create styles
    // Create styles
    const dataUrl = await QRCode.toDataURL(window.location.href);
    const subtotal = invoiceData.order.items.reduce((acc: any, item: any) => acc + item.subTotal, 0);
    const surcharges = invoiceData.order.surcharges.reduce((acc: any, surcharge: any) => acc + surcharge.amount, 0);
    const gst = 0;
    const styles = StyleSheet.create({
      page: {
        flexDirection: 'column',
        backgroundColor: '#ffffff'
      },
      section: {
        margin: 10,
        padding: 10,
        flexGrow: 1
      },
      header: {
        fontSize: 24,
        textAlign: 'center',
        marginBottom: 20,
        fontWeight: 'bold'
      },
      item: {
        flexDirection: 'row',
        marginBottom: 5,
        padding: 10
      },

      itemPrice: {
        flex: 1,
        fontSize: 14,
        textAlign: 'right'
      },

      details: {
        fontSize: 12,
        marginBottom: 20
      },
      total: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'right',
        marginTop: 20
      },



      referenceBox: {
        width: '30%',
        height: 100,
        border: '1pt solid #000',
        padding: 10,
      },
      referenceHeader: {
        fontSize: 14,
        textAlign: 'center',
      },
      referenceValue: {
        fontSize: 42,
        fontWeight: 'bold',
        textAlign: 'center',
      },
      typeBox: {
        width: '40%',
        padding: 20,
      },
      orderNumberText: {
        fontSize: 14,
        fontWeight: 'bold',
        paddingLeft: 10,
      },
      typeText: {
        fontSize: 18,
        fontWeight: 'bold',
        paddingBottom: 5,
      },
      QRCodeBox: {
        width: '30%',
      },
      row: {
        flexGrow: 1,
        flexDirection: 'row',
        padding: 10,
      },
      borderTop: {
        borderTopWidth: 1,
        padding: 10,
        backgroundColor: '#fff'
      },
      test: {
        backgroundColor: '#666',
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'nowrap',
      },
      itemDescription: {
        width: '60%',
        padding: 5,
        color: '#fff',
        fontSize: 10,
      },
      itemName: {
        width: '58%',
        fontSize: 10,
        fontWeight: 'bold'
      },
      quantityDescription:{
        width: '15%',
        padding: 5,
        color: '#fff',
        fontSize: 10,
      },
      quantityName:{
        width: '15%',
        fontSize: 10,
        fontWeight: 'bold',
        textAlign: 'center',
      },
      priceDescription:{
        width: '15%',
        padding: 5,
        color: '#fff',
        fontSize: 10,
      },
      priceName:{
        width: '15%',
        fontSize: 10,
        fontWeight: 'bold',
        textAlign: 'center',
      },
      amountDescription:{
        width: '10%',
        padding: 5,
        color: '#fff',
        fontSize: 10,
      },
      amountName:{
        width: '12%',
        fontSize: 10,
        fontWeight: 'bold',
        textAlign: 'right',
      },

      surchargeItemName:{
        width: '90%',
        fontSize: 10,
        fontWeight: 'bold'
      },

      surchargeAmountName:{
        width: '10%',
        fontSize: 10,
        fontWeight: 'bold',
        textAlign: 'right',
      },
      border: {
        borderBottomColor: '#000',
        borderBottomWidth: 1,
        borderTopColor: '#000',
        borderTopWidth: 1,
        padding: 10,
        backgroundColor: '#fff'
      },

      restaurantInfoBox: {
        width: '70%',
      },

      orderInfoBox: {
        width: '30%',
      },

      restaurantInfo: {
        fontSize: 12,
        padding: 5,
      },
      invoiceInfo: {
        fontSize: 16,
        padding: 5,
        textAlign: 'left',
      },
    });


    return (<Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.header}>Invoice</Text>

          <View style={styles.borderTop}>
            <Text style={styles.orderNumberText}>Order Number: {invoiceData.order.orderNumber}</Text>
            <View style={styles.row}>
              <View style={styles.referenceBox}>
                <Text style={styles.referenceHeader}>Order Reference</Text>
                <Text style={styles.referenceValue}>{invoiceData.orderRefference}</Text>
              </View>
              <View style={styles.typeBox}>
                <Text style={styles.typeText}>Type: {invoiceData.order.type}</Text>
                <Text style={styles.typeText}>{invoiceData.order.orderTime}</Text>
              </View>
              <View style={styles.QRCodeBox}>
                <Image src={dataUrl} style={{ width: '100%', top: -30 }} />
              </View>
            </View>
          </View>

          <View style={styles.test}>
            <View style={styles.itemDescription}>
              <Text >Item Description</Text>
            </View>
            <View style={styles.quantityDescription}>
              <Text >Quantity</Text>
            </View>
            <View style={styles.priceDescription}>
              <Text >Price</Text>
            </View>
            <View style={styles.amountDescription}>
              <Text >Amount</Text>
            </View>

            
          </View>
          <View style={styles.borderTop}>
            {invoiceData.order.items.map((item: {  dish: { thumbImage: SourceObject;price:number | string, name: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | React.ReactFragment | React.ReactPortal | null | undefined; };quantity:number, subTotal: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | React.ReactFragment | React.ReactPortal | null | undefined; }, index: React.Key | null | undefined) => (
              <View style={styles.item} key={index}>
                <Text style={styles.itemName}>{item.dish.name}</Text>
                <Text style={styles.quantityName}>{item.quantity}</Text>
                <Text style={styles.priceName}>${item.dish.price}</Text>
                <Text style={styles.amountName}>${item.subTotal}</Text>
              </View>
            ))}
            {invoiceData.order.surcharges.map((surcharge: { name: string | number | boolean | React.ReactFragment | React.ReactPortal | React.ReactElement<any, string | React.JSXElementConstructor<any>> | null | undefined; amount: string | number | boolean | React.ReactFragment | React.ReactPortal | React.ReactElement<any, string | React.JSXElementConstructor<any>> | null | undefined; }, index: React.Key | null | undefined) => (
              <View style={styles.item} key={index}>
                <Text style={styles.surchargeItemName}>{surcharge.name}</Text>
                <Text style={styles.surchargeAmountName}>${surcharge.amount}</Text>
              </View>
            ))}
          </View>

          <View style={styles.borderTop}>
            <View style={styles.row}>
              <View style={styles.restaurantInfoBox}>
                <Text style={styles.restaurantInfo}>Restaurant: {invoiceData.restaraunt}</Text>
                <Text style={styles.restaurantInfo}>Address: {invoiceData.address}</Text>
                <Text style={styles.restaurantInfo}>Phone: {invoiceData.phone}</Text>
                <Text style={styles.restaurantInfo}>ABN: 79625774882</Text>
              </View>
              <View style={styles.orderInfoBox}>
                <Text style={styles.invoiceInfo}>Items: {invoiceData.order.items.length}</Text>
                <Text style={styles.invoiceInfo}>Sub Total: ${Number(subtotal) + Number(surcharges)}</Text>
                <Text style={styles.invoiceInfo}>GST: ${Number(gst)}</Text>
                <Text style={styles.invoiceInfo}>Total: ${Number(subtotal) + Number(surcharges) + Number(gst)}</Text>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>)

  };

  render() {
    return (
      <div>
        <ToastContainer autoClose={2000} />
        <GoogleReCaptchaProvider reCaptchaKey="6Ldj-9clAAAAABJduSX_hWq0Ixvy9EIiO9dk3UXd">
          <GoogleReCaptcha onVerify={this.handleVerify} />
        </GoogleReCaptchaProvider>
        <div>Hello, World!</div>
      </div>);
  }
}




/*

const App: React.FC = () => {


  const [shortLinkValue, setShortLinkValue] = useState('https://www.google.com');
        const [fullLinkValue, setFullLinkValue] = useState('');

        const siteKey = '6Ldj-9clAAAAABJduSX_hWq0Ixvy9EIiO9dk3UXd';
        const [isVerified, setIsVerified] = useState(false);
        var [reCaptchaToken] = useState<string>('');

          const handleJsonStrChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
            setInvoiceJsonStr(event.target.value);
  };

            const handleOrderNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
              setOrderNumber(event.target.value);
  };

              const handleShortLinkChange = (event: {target: {value: React.SetStateAction<string>; }; }) => {
                setShortLinkValue(event.target.value);
  };
                const handleFullLinkChange = (event: {target: {value: React.SetStateAction<string>; }; }) => {
                  setFullLinkValue(event.target.value);
  };


  const handlePostInvoiceClick = async () => {

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




                  return (
                  <div>
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
                    <label htmlFor="inputField"> shortLink generator:</label>
                    <input type="text" value={shortLinkValue} onChange={handleShortLinkChange} />
                    <button onClick={handleGetShortLinkClick}>Get short Link</button>
                    <br />
                    <a href={fullLinkValue}>{fullLinkValue}</a>
                  </div>
                  );
} */

export default App;