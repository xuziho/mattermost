// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

const ECDSA_P256_SIGNATURE_LENGTH = 32;

function decodeBase64(base64: string): Uint8Array {
    const normalized = base64.replaceAll('-', '+').replaceAll('_', '/');
    const binary = window.atob(normalized);
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }

    return bytes;
}

function readDerInteger(bytes: Uint8Array, offset: number): {integer: Uint8Array; offset: number} {
    if (bytes[offset] !== 0x02) {
        throw new Error('Invalid DER integer');
    }

    const length = bytes[offset + 1];
    const integer = bytes.slice(offset + 2, offset + 2 + length);

    return {integer, offset: offset + 2 + length};
}

function normalizeEcdsaInteger(integer: Uint8Array): Uint8Array {
    let value = integer;
    while (value.length > ECDSA_P256_SIGNATURE_LENGTH && value[0] === 0) {
        value = value.slice(1);
    }

    if (value.length > ECDSA_P256_SIGNATURE_LENGTH) {
        throw new Error('Invalid ECDSA integer length');
    }

    const normalized = new Uint8Array(ECDSA_P256_SIGNATURE_LENGTH);
    normalized.set(value, ECDSA_P256_SIGNATURE_LENGTH - value.length);

    return normalized;
}

function derToRawEcdsaSignature(signature: Uint8Array): Uint8Array {
    if (signature[0] !== 0x30) {
        throw new Error('Invalid DER sequence');
    }

    const sequenceLength = signature[1];
    if (sequenceLength + 2 !== signature.length) {
        throw new Error('Invalid DER sequence length');
    }

    const r = readDerInteger(signature, 2);
    const s = readDerInteger(signature, r.offset);
    if (s.offset !== signature.length) {
        throw new Error('Invalid DER signature length');
    }

    const rawSignature = new Uint8Array(ECDSA_P256_SIGNATURE_LENGTH * 2);
    rawSignature.set(normalizeEcdsaInteger(r.integer), 0);
    rawSignature.set(normalizeEcdsaInteger(s.integer), ECDSA_P256_SIGNATURE_LENGTH);

    return rawSignature;
}

export async function verifyErrorPageSignature(publicKey: string | undefined, signedPath: string, signature: string): Promise<boolean> {
    if (!publicKey || !window.crypto?.subtle) {
        return false;
    }

    try {
        const importedKey = await window.crypto.subtle.importKey(
            'spki',
            decodeBase64(publicKey),
            {
                name: 'ECDSA',
                namedCurve: 'P-256',
            },
            false,
            ['verify'],
        );

        return window.crypto.subtle.verify(
            {
                name: 'ECDSA',
                hash: 'SHA-256',
            },
            importedKey,
            derToRawEcdsaSignature(decodeBase64(signature)),
            new TextEncoder().encode(signedPath),
        );
    } catch {
        return false;
    }
}
