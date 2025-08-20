// src/providers/PersianNumbersProvider.jsx
import React, { useEffect } from 'react';

const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

const convertToPersianNumbers = (node) => {
  if (node.nodeType === Node.TEXT_NODE) {
    node.nodeValue = node.nodeValue.replace(/[0-9]/g, (match) => persianDigits[parseInt(match)]);
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    // Skip script, style, and textarea elements
    if (!['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT'].includes(node.tagName)) {
      node.childNodes.forEach(convertToPersianNumbers);
    }
  }
};

export const PersianNumbersProvider = ({ children }) => {
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            convertToPersianNumbers(node);
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Initial conversion
    convertToPersianNumbers(document.body);

    return () => observer.disconnect();
  }, []);

  return children;
};