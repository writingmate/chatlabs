const normalizeSrc = src => {
    return src.startsWith('/') ? src.slice(1) : src;
};

export default function cloudflareLoader({ src, width, quality }) {
    const params = [`width=${width}`];
    if (quality) {
        params.push(`quality=${quality}`);
    }
    const paramsString = params.join(',');
    if (process.env.NODE_ENV === 'development') {
        return src;
    }

    return `/cdn-cgi/image/${paramsString}/${normalizeSrc(src)}`;
};