# downsample images in ./original from 512x512 to 16x16

import os
import cv2
import numpy as np

def downsample():
    original_dir = './original'
    downsampled_dir = '.'

    if not os.path.exists(downsampled_dir):
        os.makedirs(downsampled_dir)
    # files that start with "data" are transparent black and white images
    for filename in os.listdir(original_dir):
        if filename.startswith('data'):
            img = cv2.imread(os.path.join(original_dir, filename), cv2.IMREAD_UNCHANGED)
            img = cv2.resize(img, (32, 32), interpolation=cv2.INTER_AREA)
            cv2.imwrite(os.path.join(downsampled_dir, filename), img)
        else:
            img = cv2.imread(os.path.join(original_dir, filename), cv2.IMREAD_UNCHANGED)
            img = cv2.resize(img, (32, 32), interpolation=cv2.INTER_AREA)
            cv2.imwrite(os.path.join(downsampled_dir, filename), img)

if __name__ == '__main__':
    downsample()