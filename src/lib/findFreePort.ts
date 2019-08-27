// Copied from https://github.com/microsoft/vscode/blob/608fc2cee2f1a4c832d8c23b9d4e28805ddf6041/src/vs/base/node/ports.ts
// under the MIT license. An exact copy of the license and copyright notice from the source version can be found at
// src/lib/LICENSE.txt, and applies to the recursive contents of the `src/lib` directory.

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as net from 'net';

/**
 * @returns Returns a random port between 1025 and 65535.
 */
export function randomPort(): number {
  const min = 1025;
  const max = 65535;
  return min + Math.floor((max - min) * Math.random());
}

/**
 * Given a start point and a max number of retries, will find a port that
 * is openable. Will return 0 in case no free port can be found.
 */
export function findFreePort(startPort: number, giveUpAfter: number, timeout: number): Promise<number> {
  let done = false;

  return new Promise(resolve => {
    const timeoutHandle = setTimeout(() => {
      if (!done) {
        done = true;
        return resolve(0);
      }
    }, timeout);

    doFindFreePort(startPort, giveUpAfter, (port) => {
      if (!done) {
        done = true;
        clearTimeout(timeoutHandle);
        return resolve(port);
      }
    });
  });
}

function doFindFreePort(startPort: number, giveUpAfter: number, clb: (port: number) => void): void {
  if (giveUpAfter === 0) {
    return clb(0);
  }

  const client = new net.Socket();

  // If we can connect to the port it means the port is already taken so we continue searching
  client.once('connect', () => {
    dispose(client);

    return doFindFreePort(startPort + 1, giveUpAfter - 1, clb);
  });

  client.once('data', () => {
    // this listener is required since node.js 8.x
  });

  client.once('error', (err: Error & { code?: string }) => {
    dispose(client);

    // If we receive any non ECONNREFUSED error, it means the port is used but we cannot connect
    if (err.code !== 'ECONNREFUSED') {
      return doFindFreePort(startPort + 1, giveUpAfter - 1, clb);
    }

    // Otherwise it means the port is free to use!
    return clb(startPort);
  });

  client.connect(startPort, '127.0.0.1');
}

function dispose(socket: net.Socket): void {
  try {
    socket.removeAllListeners('connect');
    socket.removeAllListeners('error');
    socket.end();
    socket.destroy();
    socket.unref();
  } catch (error) {
    console.error(error); // otherwise this error would get lost in the callback chain
  }
}