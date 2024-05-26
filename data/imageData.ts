// src/imageData.ts
export interface ImageData {
    url: string;
    alt: string;
    name: string;
    }

const images: ImageData[] = [
    { url: 'https://cdn.sei.io/brand_/brand_01.png', alt: 'Logotype', name: 'brand_01' },
    { url: 'https://cdn.sei.io/brand_/brand_02.png', alt: 'Main Logo', name: 'brand_02' },
    { url: 'https://cdn.sei.io/brand_/brand_03.png', alt: 'Symbol Gradient', name: 'brand_03' },
    { url: 'https://cdn.sei.io/brand_/brand_04.png', alt: 'Symbol Clearspace', name: 'brand_04' },
    { url: 'https://cdn.sei.io/brand_/brand_05.png', alt: 'Logo Misuse', name: 'brand_05' },
    { url: 'https://cdn.sei.io/brand_/brand_06.png', alt: 'Sei Color Palette', name: 'brand_06' },
    { url: 'https://cdn.sei.io/brand_/brand_07.png', alt: 'Sei Gradient', name: 'brand_07' },
    { url: 'https://cdn.sei.io/brand_/brand_08.png', alt: 'Typography', name: 'brand_08' },
    { url: 'https://cdn.sei.io/brand_/brand_09.png', alt: 'Typography', name: 'brand_09' },
    { url: 'https://cdn.sei.io/brand_/brand_10.png', alt: 'Typography', name: 'brand_10' },
    { url: 'https://cdn.sei.io/brand_/brand_11.png', alt: 'Typography', name: 'brand_11' },
    // Add more image entries as needed
    ];

export default images;
