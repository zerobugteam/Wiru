"""
Smart Aquaculture IoT Demo Server
ZeroBug Team x SMKS Perikanan dan Kelautan Puger
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
        print("=" * 60)
        print(" ZeroBug Team - Smart Aquaculture IoT Simulation")
        print(" SMKS Perikanan dan Kelautan Puger")
        print("=" * 60)
        print(f" Server berjalan di : {url}")
        print(" Tekan CTRL+C di terminal untuk menghentikan server.")
        print("=" * 60)
        
        # Buka browser otomatis
        webbrowser.open(url)
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer dihentikan.")
            sys.exit(0)

if __name__ == "__main__":
    run()
