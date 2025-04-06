/**
 * Interface for a text node with its position information
 */
interface VisibleTextNode {
  text: string;
  element: Element | null;
  rect: {
    left: number;
    right: number;
    top: number;
    bottom: number;
    width: number;
    height: number;
  };
}

/**
 * Extracts all visible text nodes within the viewport bounds of an iframe
 * @param iframe - The iframe element to extract text from
 * @returns Array of visible text node objects
 */
function extractVisibleTextNodesFromIframe(
  iframe: HTMLIFrameElement
): VisibleTextNode[] {
  // Check if iframe exists
  if (!iframe) {
    console.error("Iframe element not found");
    return [];
  }

  // Get iframe document
  let iframeDocument: Document;
  try {
    // For same-origin iframes
    iframeDocument =
      iframe.contentDocument || (iframe.contentWindow?.document as Document);
    if (!iframeDocument) {
      throw new Error("Cannot access iframe document");
    }
  } catch (e) {
    console.error(
      "Cannot access iframe content, possible cross-origin restriction:",
      e
    );
    return [];
  }

  // Get viewport dimensions (the visible area)
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Get iframe position relative to the viewport
  const iframeRect = iframe.getBoundingClientRect();

  // Function to get all text nodes
  function getAllTextNodes(node: Node, textNodes: Node[] = []): Node[] {
    if (node.nodeType === Node.TEXT_NODE) {
      // Only include non-empty text nodes (trim whitespace)
      if (node.textContent && node.textContent.trim()) {
        textNodes.push(node);
      }
    } else {
      // Skip script and style elements
      const nodeName = node.nodeName.toLowerCase();
      if (nodeName !== "script" && nodeName !== "style") {
        // Recursively process child nodes
        for (let i = 0; i < node.childNodes.length; i++) {
          getAllTextNodes(node.childNodes[i], textNodes);
        }
      }
    }
    return textNodes;
  }

  // Get all text nodes from the iframe document body
  const allTextNodes = getAllTextNodes(iframeDocument.body);

  // Filter for visible text nodes
  const visibleTextNodes = allTextNodes.filter((textNode) => {
    // Get the element that contains this text node
    const element = textNode.parentElement;
    if (!element) return false;

    // Skip if element or any ancestor has display:none, visibility:hidden, etc.
    let currentEl: Element | null = element;
    while (currentEl) {
      const style = iframeDocument.defaultView?.getComputedStyle(currentEl);
      if (
        style?.display === "none" ||
        style?.visibility === "hidden" ||
        style?.opacity === "0"
      ) {
        return false;
      }
      currentEl = currentEl.parentElement;
    }

    // Get positioning information
    const range = iframeDocument.createRange();
    range.selectNodeContents(textNode);

    // Get bounding client rect for the text node within the iframe
    const rects = Array.from(range.getClientRects());

    // If there are no rects, the text node is not visible
    if (rects.length === 0) return false;

    // Check if any part of the text node is within the viewport
    return rects.some((rect) => {
      // Adjust rect coordinates relative to main window viewport
      const adjustedRect = {
        left: rect.left + iframeRect.left,
        right: rect.right + iframeRect.left,
        top: rect.top + iframeRect.top,
        bottom: rect.bottom + iframeRect.top,
      };

      // Check if the rect is within the viewport
      return (
        adjustedRect.right > 0 &&
        adjustedRect.left < viewportWidth &&
        adjustedRect.bottom > 0 &&
        adjustedRect.top < viewportHeight
      );
    });
  });

  // Return detailed information about visible text nodes
  return visibleTextNodes.map((node) => {
    const range = iframeDocument.createRange();
    range.selectNodeContents(node);
    const rects = range.getClientRects();

    // Get the first rect (usually there's just one for text nodes)
    const rect = rects[0];

    if (!rect) {
      return {
        text: node.textContent || "",
        element: node.parentElement,
        rect: {
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          width: 0,
          height: 0,
        },
      };
    }

    // Adjust rect coordinates relative to main window viewport
    const adjustedRect = {
      left: rect.left + iframeRect.left,
      right: rect.right + iframeRect.left,
      top: rect.top + iframeRect.top,
      bottom: rect.bottom + iframeRect.top,
      width: rect.width,
      height: rect.height,
    };

    return {
      text: node.textContent || "",
      element: node.parentElement,
      rect: adjustedRect,
    };
  });
}

/**
 * Get visible text from an iframe using a selector
 * @param selector - CSS selector for the iframe
 * @returns Array of visible text node objects
 */
export function getVisibleTextFromIframeBySelector(
  selector: string = "iframe"
): VisibleTextNode[] {
  const iframe = document.querySelector(selector) as HTMLIFrameElement | null;
  if (!iframe) {
    console.error(`No iframe found with selector: ${selector}`);
    return [];
  }

  return extractVisibleTextNodesFromIframe(iframe);
}
