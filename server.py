import http.server
import socketserver
import os
import sys

PORT = 5000

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()
    
    def do_GET(self):
        if self.path == '/script.js':
            try:
                with open('script.js', 'r', encoding='utf-8') as f:
                    content = f.read()
                
                api_key = os.environ.get('GOOGLE_API_KEY', '')
                
                if not api_key:
                    print("WARNING: GOOGLE_API_KEY environment variable is not set.", file=sys.stderr)
                    print("Firebase functionality will be limited.", file=sys.stderr)
                
                content = content.replace('GOOGLE_API_KEY', api_key)
                
                self.send_response(200)
                self.send_header('Content-type', 'application/javascript')
                self.send_header('Content-Length', str(len(content.encode('utf-8'))))
                self.end_headers()
                self.wfile.write(content.encode('utf-8'))
            except Exception as e:
                self.send_error(500, f"Error serving script.js: {str(e)}")
        else:
            super().do_GET()

if __name__ == '__main__':
    api_key = os.environ.get('GOOGLE_API_KEY', '')
    
    if not api_key:
        print("=" * 70)
        print("WARNING: GOOGLE_API_KEY environment variable is not set!")
        print("Firebase functionality will be limited.")
        print("Please set the GOOGLE_API_KEY environment variable for full functionality.")
        print("=" * 70)
    else:
        print("GOOGLE_API_KEY is configured.")
    
    with socketserver.TCPServer(("0.0.0.0", PORT), CustomHTTPRequestHandler) as httpd:
        print(f"Server running at http://0.0.0.0:{PORT}")
        httpd.serve_forever()
