export const WHATSAPP_NUMBER = '918848708529';
export const WHATSAPP_DISPLAY = '+91 88487 08529';
export const CALL_DISPLAY = '+91 99956 19470';
export const EMAIL = 'support@celestiallights.in';

type EnquiryProduct = {
  title: string;
  model: string;
};

export function enquiryMessage(product?: EnquiryProduct): string {
  if (!product) {
    return 'Hello Celestial Lights, I would like to enquire about a fitting.';
  }

  return `Hello Celestial Lights, I would like to buy ${product.title}, model ${product.model}. Please share the price, available finishes, and lead time.`;
}

export function enquiryUrl(product?: EnquiryProduct): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(enquiryMessage(product))}`;
}

export function contactMessage(product?: EnquiryProduct): string {
  if (!product) {
    return 'Hello Celestial Lights,\n\nI would like to purchase a fitting. Please share the price, available finishes, and lead time.\n';
  }

  return `Hello Celestial Lights,\n\nI would like to purchase ${product.title}, model ${product.model}. Please share the price, available finishes, and lead time.\n`;
}

export function contactUrl(product?: EnquiryProduct): string {
  const subject = product
    ? `Purchase enquiry, ${product.model}`
    : 'Purchase enquiry';
  return `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(contactMessage(product))}`;
}
