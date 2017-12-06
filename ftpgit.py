import os
import re

git_status = os.popen("git status").read()
print git_status

#result = re.findall('.*?application/[a-zA-Z/_\-\.]*|.*?inc/[a-zA-Z/_\-\.]*', git_status)
#result = re.findall('Untracked files:\n.*\n.*\n.*\n', git_status)

result = re.findall('\t.*\n', git_status)

print result
from ftplib import FTP 
ftp = FTP('infovis.dothome.co.kr','infovis','infovis1')
ftp.cwd('html')
for file_path in result:
	if re.findall('delete',file_path): 
		continue;
	else:
		file_path = re.sub(r"new file:","",file_path)
		file_path = re.sub(r"modified:","",file_path)
		file_path = re.sub(r"deleted:","",file_path)
		file_path = file_path.strip()
		print file_path
		print file_path + ' ' + ftp.storbinary('STOR '+file_path, open(file_path,"rb"))
