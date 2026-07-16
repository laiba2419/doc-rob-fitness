export type GatewayId = 'razorpay' | 'stripe' | 'paytm' | 'flutterwave';

export type GatewayConfig = {
  id: GatewayId;
  name: string;
  accentColor: string;
  cardBg: string;
  brandText: string;
  image: any;
};

export const gateways: GatewayConfig[] = [
  {
    id: 'razorpay',
    name: 'Razor pay',
    accentColor: '#3395FF',
    cardBg: '#3395FF',
    brandText: 'Razorpay',
    image: require('../../assets/images/profile/razorpay.png'),
  },
  {
    id: 'stripe',
    name: 'Stripe',
    accentColor: '#635BFF',
    cardBg: '#635BFF',
    brandText: 'stripe',
    image: require('../../assets/images/profile/stripe.png'),
  },
  {
    id: 'paytm',
    name: 'Paytm',
    accentColor: '#00BAF2',
    cardBg: '#00BAF2',
    brandText: 'paytm',
    image: require('../../assets/images/profile/paytm.png'),
  },
  {
    id: 'flutterwave',
    name: 'FlutterWave',
    accentColor: '#F5A623',
    cardBg: '#F5A623',
    brandText: 'Flutterwave',
    image: require('../../assets/images/profile/flutterwave.png'),
  },
];

export const getGateway = (id: string): GatewayConfig =>
  gateways.find((g) => g.id === id) ?? gateways[0];