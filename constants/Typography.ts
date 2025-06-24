/**
 * Typography system for the Fraterna app.
 * 
 * This file contains all typography variables including font sizes, weights, and line heights
 * to ensure consistent typography across the entire application.
 * 
 * Usage examples:
 * - Headers: Typography.header
 * - Body text: Typography.body
 * - Labels: Typography.label
 * - Captions: Typography.caption
 * - Buttons: Typography.button
 * - Inputs: Typography.input
 */

export const Typography = {
  // Headers and titles
  header: {
    fontSize: 18,
    fontWeight: '700' as const,
    lineHeight: 24,
  },
  
  // Field labels and section titles
  label: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 20,
  },
  
  // Body text and content
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  
  // Secondary text (dates, counts, etc.)
  caption: {
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 18,
  },
  
  // Small text (metadata, footnotes)
  small: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  
  // Button text
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 20,
  },
  
  // Input text
  input: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  
  // Section titles
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    lineHeight: 24,
  },
  
  // Subsection titles
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 20,
  },
  
  // Modal titles
  modalTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    lineHeight: 24,
  },
};

// Helper function to get typography style
export const getTypography = (key: keyof typeof Typography) => {
  return Typography[key];
}; 