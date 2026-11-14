"""
WIRU - Water Intelligence for Raising Underwater life
Demo Server | SMKS Perikanan dan Kelautan Puger
"""
import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

def run():
    os.chdir(DIRECTORY)
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        url = f"http://localhost:{PORT}/index.html"
        print("=" * 64)
        print(" WIRU - Water Intelligence for Raising Underwater life")
        print(" SMKS Perikanan dan Kelautan Puger")
        print("=" * 64)
        print(f" Server berjalan di : {url}")
        print(" Tekan CTRL+C di terminal untuk menghentikan server.")
        print("=" * 64)
        
        webbrowser.open(url)
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer dihentikan.")
            sys.exit(0)

if __name__ == "__main__":
    run()
