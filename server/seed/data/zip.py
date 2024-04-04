# zip files in {1..7} into {1..7}.zip
# the directories themselves are not zipped, only the files inside them

import zipfile
import os

for i in range(1, 8):
    with zipfile.ZipFile(f'{i}.zip', 'w') as z:
        for f in os.listdir(str(i)):
            z.write(f'{i}/{f}', f)
