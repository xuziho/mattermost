// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

function getRandomBytes(byteLength: number): Uint8Array {
    const randomBytes = new Uint8Array(byteLength);
    window.crypto.getRandomValues(randomBytes);
    return randomBytes;
}

export function randomHex(byteLength: number): string {
    return Array.from(getRandomBytes(byteLength)).
        map((byte) => byte.toString(16).padStart(2, '0')).
        join('');
}

export function randomBase64(byteLength: number): string {
    const bytes = getRandomBytes(byteLength);
    let binary = '';
    bytes.forEach((byte) => {
        binary += String.fromCharCode(byte);
    });

    return window.btoa(binary);
}
