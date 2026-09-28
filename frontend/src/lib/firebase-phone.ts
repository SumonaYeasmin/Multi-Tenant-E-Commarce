import { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult, type UserCredential } from 'firebase/auth';
import { auth } from './firebase';

let storedConfirmationResult: ConfirmationResult | null = null;

/**
 * ফরম্যাট করে মোবাইল নম্বরকে আন্তর্জাতিক E.164 ফরম্যাটে রূপান্তর করে (+880...)
 */
export function formatBangladeshiPhone(phone: string): string {
  const cleaned = phone.replace(/[\s\-()]/g, '');
  if (cleaned.startsWith('+')) {
    return cleaned;
  }
  if (cleaned.startsWith('880')) {
    return '+' + cleaned;
  }
  if (cleaned.startsWith('0')) {
    return '+88' + cleaned;
  }
  return '+880' + cleaned;
}

/**
 * reCAPTCHA পুরোপুরি রিসেট করার ফাংশন
 */
export function resetRecaptcha(containerId: string = 'recaptcha-container') {
  if (typeof window === 'undefined') return;

  if ((window as any).recaptchaVerifier) {
    try {
      (window as any).recaptchaVerifier.clear();
    } catch {
      // ignore
    }
    (window as any).recaptchaVerifier = null;
  }

  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = '';
  }
}

/**
 * সেফলি RecaptchaVerifier ইনিশিয়ালাইজ বা রি-ইউজ করা
 */
function getRecaptchaVerifier(containerId: string): RecaptchaVerifier {
  const container = document.getElementById(containerId);
  if (!container) {
    throw new Error(`Recaptcha container element with ID "${containerId}" not found in DOM.`);
  }

  if ((window as any).recaptchaVerifier) {
    return (window as any).recaptchaVerifier;
  }

  // কন্টেইনার খালি করে নতুন ভেরিফায়ার তৈরি
  container.innerHTML = '';

  const verifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
  });

  (window as any).recaptchaVerifier = verifier;
  return verifier;
}

/**
 * Firebase Phone SMS OTP পাঠানোর ফাংশন
 */
export async function sendFirebasePhoneOtp(
  phone: string,
  containerId: string = 'recaptcha-container'
): Promise<{ result: ConfirmationResult; formattedPhone: string }> {
  if (typeof window === 'undefined') {
    throw new Error('Window is not available');
  }

  const formattedPhone = formatBangladeshiPhone(phone);

  try {
    const verifier = getRecaptchaVerifier(containerId);
    const result = await signInWithPhoneNumber(auth, formattedPhone, verifier);
    storedConfirmationResult = result;
    (window as any).confirmationResult = result;
    return { result, formattedPhone };
  } catch (error: any) {
    // এরর হলে reCAPTCHA রিসেট করে দেওয়া যাতে পরের ক্লিকে সমস্যা না হয়
    resetRecaptcha(containerId);
    throw error;
  }
}

/**
 * ইউজার প্রদত্ত OTP কোড ভেরিফাই করার ফাংশন
 */
export async function verifyFirebasePhoneOtp(code: string): Promise<{ userCredential: UserCredential; token: string }> {
  const result =
    storedConfirmationResult ||
    (typeof window !== 'undefined' ? (window as any).confirmationResult : null);

  if (!result) {
    throw new Error('Session expired or OTP session not found. Please request a new code.');
  }

  const userCredential = await result.confirm(code);
  const token = await userCredential.user.getIdToken();

  return { userCredential, token };
}
