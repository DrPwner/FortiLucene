import re

def process_ip_file(file_content: str) -> list:
    ip_pattern = r'\b(?:\d{1,3}\.){3}\d{1,3}\b'
    ips = re.findall(ip_pattern, file_content)
    return [ip for ip in ips if validate_ip(ip)]

def validate_ip(ip: str) -> bool:
    parts = ip.split('.')
    return len(parts) == 4 and all(0 <= int(part) < 256 for part in parts)