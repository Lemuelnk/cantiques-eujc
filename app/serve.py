#!/usr/bin/env python3
"""
Serveur de développement pour Cantiques EUJC.
Envoie Cache-Control: no-store pour éviter tout cache navigateur.
"""
from http.server import HTTPServer, SimpleHTTPRequestHandler

class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

if __name__ == '__main__':
    port = 8080
    server = HTTPServer(('', port), NoCacheHandler)
    print(f'🚀 Serveur no-cache sur http://localhost:{port}/')
    print('   Ctrl+C pour arrêter')
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\n👋 Serveur arrêté')
