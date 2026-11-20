import type { FeedbackModalLabels } from './FeedbackModal';
import { DEFAULT_MAX_IMAGES, DEFAULT_MAX_IMAGE_BYTES } from '../ImageAttachments/ImageAttachments';

const MB = DEFAULT_MAX_IMAGE_BYTES / 1024 / 1024;

// The built-in text, in English and French. A caller passes `labels` only for what it says differently.
export const DEFAULT_LABELS: { en: FeedbackModalLabels; fr: FeedbackModalLabels } = {
  en: {
    heading: 'Send feedback',
    intro: 'Tell us what works, what does not, or what you would like to see. It goes to the admins, who will see your name and can reply to you unless you send it anonymously.',
    messageLabel: 'Your feedback',
    messagePlaceholder: 'What is on your mind?',
    messageRequired: 'Write your feedback first.',
    imagesLabel: 'Images (optional)',
    addImages: 'Add images',
    removeImage: 'Remove image',
    imageTooLarge: `An image is over ${MB} MB.`,
    tooManyImages: `You can attach up to ${DEFAULT_MAX_IMAGES} images.`,
    unsupportedImage: 'That file is not a supported image. Use JPEG, PNG, GIF, WebP or HEIC.',
    anonymousLabel: 'Send anonymously',
    anonymousNote: 'Your name is not shared and nothing links this feedback to you. The admins will not be able to contact you or reply.',
    sendError: 'Could not send your feedback.',
    cancel: 'Cancel',
    sending: 'Sending…',
    send: 'Send feedback',
    sentToast: 'Thanks, your feedback was sent',
  },
  fr: {
    heading: 'Envoyer un commentaire',
    intro: "Dites-nous ce qui fonctionne, ce qui ne fonctionne pas ou ce que vous aimeriez voir. Il est transmis aux administrateurs, qui verront votre nom et pourront vous répondre, sauf si vous l'envoyez de façon anonyme.",
    messageLabel: 'Votre commentaire',
    messagePlaceholder: "Qu'avez-vous en tête?",
    messageRequired: "Écrivez d'abord votre commentaire.",
    imagesLabel: 'Images (facultatif)',
    addImages: 'Ajouter des images',
    removeImage: "Retirer l'image",
    imageTooLarge: `Une image dépasse ${MB} Mo.`,
    tooManyImages: `Vous pouvez joindre jusqu'à ${DEFAULT_MAX_IMAGES} images.`,
    unsupportedImage: "Ce fichier n'est pas une image prise en charge. Utilisez JPEG, PNG, GIF, WebP ou HEIC.",
    anonymousLabel: 'Envoyer de façon anonyme',
    anonymousNote: "Votre nom n'est pas communiqué et rien ne relie ce commentaire à vous. Les administrateurs ne pourront ni vous joindre ni vous répondre.",
    sendError: "Impossible d'envoyer votre commentaire.",
    cancel: 'Annuler',
    sending: 'Envoi en cours…',
    send: 'Envoyer le commentaire',
    sentToast: 'Merci, votre commentaire a été envoyé',
  },
};
