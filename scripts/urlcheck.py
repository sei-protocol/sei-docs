import os
import re
import requests
import socket

def check_url_status(url):
    try:
        response = requests.head(url, allow_redirects=True, timeout=5)
        return response.status_code, response.reason
    except requests.RequestException as e:
        return None, str(e)

def find_urls(text):
    # Only match valid URLs starting with http:// or https://
    url_pattern = re.compile(r'https?://[^\s"\'<>\)]*')
    return url_pattern.findall(text)

def is_valid_url(url):
    try:
        domain = re.findall(r'://([^/]+)', url)[0]
        socket.gethostbyname(domain)  # Check if domain resolves to an IP
        return True
    except (socket.gaierror, IndexError):
        return False

def check_files_in_directory(directory):
    report = []

    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith(('.md', '.mdx')):  # Check both .md and .mdx files
                file_path = os.path.join(root, file)
                with open(file_path, 'r', encoding='utf-8') as f:
                    for line_number, line in enumerate(f, 1):
                        urls = find_urls(line)
                        for url in urls:
                            if is_valid_url(url):
                                status_code, reason = check_url_status(url)
                                # Exclude specific status codes from report
                                if status_code and status_code not in {200, 403, 415}:
                                    report.append({
                                        'file': file_path,
                                        'line': line_number,
                                        'url': url,
                                        'status_code': status_code,
                                        'reason': reason
                                    })
    return report

def generate_report(report):
    for item in report:
        print(f"File: {item['file']}, Line: {item['line']}")
        print(f"URL: {item['url']}")
        print(f"Status Code: {item['status_code']}, Reason: {item['reason']}")
        print("-" * 40)

if __name__ == "__main__":
    check_path = './pages/'  # path to check
    report = check_files_in_directory(check_path)
    generate_report(report)
