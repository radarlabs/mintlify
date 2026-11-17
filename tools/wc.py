"""Prose word count per page, including imported snippets. Usage: python3 -I wc.py <file.mdx> [...]"""
import re,sys,os
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
tot=0
for f in sys.argv[1:]:
    t=open(f).read()
    imps=re.findall(r"^import \w+ from '(/snippets/[\w-]+)\.mdx'",t,flags=re.M)
    full=t.split('---',2)[2] if t.startswith('---') else t
    full+=''.join(open(i[1:]+'.mdx').read() for i in imps if os.path.exists(i[1:]+'.mdx'))
    code=re.findall(r'```.*?```',full,flags=re.S)
    prose=re.sub(r'```.*?```','',full,flags=re.S)
    prose=re.sub(r"^import .*$",'',prose,flags=re.M)
    w=len(re.findall(r'\w+',prose)); tot+=w
    print(f"{w:6} words {sum(c.count(chr(10)) for c in code):5} code lines {len(re.findall(r'^## ',prose,flags=re.M)):3} h2 {len(re.findall(r'^### ',prose,flags=re.M)):3} h3  {f}")
if len(sys.argv)>2: print(f"{tot:6} words total")
