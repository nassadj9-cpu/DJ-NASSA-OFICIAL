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
    
    def inject_firebase_config(self, content):
        firebase_api_key = os.environ.get('FIREBASE_API_KEY', '')
        firebase_auth_domain = os.environ.get('FIREBASE_AUTH_DOMAIN', '')
        firebase_project_id = os.environ.get('FIREBASE_PROJECT_ID', '')
        firebase_storage_bucket = os.environ.get('FIREBASE_STORAGE_BUCKET', '')
        firebase_messaging_sender_id = os.environ.get('FIREBASE_MESSAGING_SENDER_ID', '')
        firebase_app_id = os.environ.get('FIREBASE_APP_ID', '')
        
        js_config = f"""
window.FIREBASE_API_KEY = '{firebase_api_key}';
window.FIREBASE_AUTH_DOMAIN = '{firebase_auth_domain}';
window.FIREBASE_PROJECT_ID = '{firebase_project_id}';
window.FIREBASE_STORAGE_BUCKET = '{firebase_storage_bucket}';
window.FIREBASE_MESSAGING_SENDER_ID = '{firebase_messaging_sender_id}';
window.FIREBASE_APP_ID = '{firebase_app_id}';
"""
        return js_config + content
    
    def do_GET(self):
        if self.path in ['/script.js', '/playlist.js', '/videos.js']:
            try:
                filename = self.path[1:]
                with open(filename, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                content = self.inject_firebase_config(content)
                
                self.send_response(200)
                self.send_header('Content-type', 'application/javascript')
                self.send_header('Content-Length', str(len(content.encode('utf-8'))))
                self.end_headers()
                self.wfile.write(content.encode('utf-8'))
            except Exception as e:
                self.send_error(500, f"Error serving {self.path}: {str(e)}")
        else:
            super().do_GET()

if __name__ == '__main__':
    required_vars = [
        'FIREBASE_API_KEY',
        'FIREBASE_AUTH_DOMAIN',
        'FIREBASE_PROJECT_ID',
        'FIREBASE_STORAGE_BUCKET',
        'FIREBASE_MESSAGING_SENDER_ID',
        'FIREBASE_APP_ID'
    ]
    
    missing_vars = [var for var in required_vars if not os.environ.get(var)]
    
    if missing_vars:
        print("=" * 70)
        print("WARNING: Firebase configuration is incomplete!")
        print("Missing environment variables:")
        for var in missing_vars:
            print(f"  - {var}")
        print("\nFirebase functionality will be limited.")
        print("Please configure all Firebase environment variables for full functionality.")
        print("=" * 70)
    else:
        print("✓ Firebase configuration is complete.")
    
    with socketserver.TCPServer(("0.0.0.0", PORT), CustomHTTPRequestHandler) as httpd:
        print(f"Server running at http://0.0.0.0:{PORT}")
        httpd.serve_forever()
