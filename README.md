# Bike Fitting Web Application

## Project Overview
This project aims to develop a web application that helps cyclists optimize their posture for better performance and injury prevention. The system will analyze images or videos of cyclists and provide feedback on their positioning.

## Features
- **Pose Estimation**: Detects key joint positions of a cyclist using a trained deep learning model.
- **Angle Analysis**: Computes joint angles to evaluate posture and provide insights.
- **Cyclist Detection**: Ensures the image contains a cyclist before performing analysis.
- **Web-Based Interface**: Users can upload images/videos and receive real-time feedback.

## Data
- **Cyclist Detection Dataset:** TBD (Needs an open dataset with labeled cyclist images)
- **Pose Estimation Dataset:** MPII Human Pose Dataset ([Link](http://human-pose.mpi-inf.mpg.de/))

## Models
### 1. Cyclist Detection
- A pre-trained convolutional neural network (e.g., ResNet, MobileNet) fine-tuned for classifying images as containing a cyclist or not.

### 2. Pose Estimation
- A deep learning model trained from scratch on MPII to predict joint locations.
- Potential architectures: Stacked Hourglass Network, HRNet, or another state-of-the-art pose estimation model.

### 3. Posture Evaluation
- A rule-based algorithm that calculates joint angles and determines whether the posture aligns with biomechanical guidelines.

## Future Enhancements
- Fine-tuning the model with cyclist-specific data.
- Providing automatic recommendations for bike adjustments.
- Implementing real-time video analysis.

## Data Structure
This is how the folder structure should look like for it to work (some files are generated from the code).
```
data
│
└─── mpii
│    │   data.json
│    │   joints.json
│    │   train_dataset.h5
│    │
│    └─── mpii_human_pose_v1
│         │   mpii_human_pose_v1_u12_1.mat
│         │   ...
│         │   
│         └─── images
│              │ {...}.jpg
|
```

## Requirements
If you have an NVIDIA GPU (with CUDA support) on native Windows, you will need these:
```
numpy==1.21.3
scipy==1.7.2
opencv-python
h5py
matplotlib==3.8.4
tensorflow-gpu==2.10.0
```

---
Stay tuned for more updates as the project progresses!
