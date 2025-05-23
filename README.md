# Bike Fitting Web Application

Live App: https://bikefit.bysaether.com

## Project Overview
This project aims to develop a web application that helps cyclists optimize their posture for better performance and injury prevention. The system will analyze images or videos of cyclists and provide feedback on their positioning.

## Features
- **Pose Estimation**: Detects key joint positions of a cyclist using a trained deep learning model.
- **Angle Analysis**: Computes joint angles to evaluate posture and provide insights.
- **Cyclist Detection**: Ensures the image contains a cyclist before performing analysis.
- **Web-Based Interface**: Users can upload images/videos and receive real-time feedback.

## Data
- **Pose Estimation Dataset:** MPII Human Pose Dataset ([Link](http://human-pose.mpi-inf.mpg.de/)) and COCO Dataset ([Link](https://cocodataset.org/#home))

## Models

### 1. Pose Estimation
- Deep learning model trained from scratch on COCO to predict joint locations.
  - Simple Custom CNN
  - Pretrained ResNet-50 Backbone
- MoveNet Lightning & Thunder

### 2. Posture Evaluation
- A rule-based algorithm that calculates joint angles and determines whether the posture aligns with biomechanical guidelines (based on MyVeloFit guidelines).

### 3. OpenAI API - GPT-4.0
- Web app retrieves feedback from a GPT-4.0 model for user bike fit recommendations.

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
│
└─── coco
│    │   joints.json
│    │   person_keypoints_train2017.json
│    │   person_keypoints_val2017.json
│    │   
│    └─── images
│         └─── train2017
│         │    │ {...}.jpg
│         │
│         └─── val2017
│              │ {...}.jpg
```

## Requirements
If you have an NVIDIA GPU (with CUDA support) on native Windows (and wish to use GPU for training), you will need these:
```
tensorflow-gpu==2.10.0
numpy==1.21.3
scipy==1.7.2
opencv-python
h5py
matplotlib==3.7.5
```
A quick way to do this is like this:
```
conda create -n tf_gpu python=3.8 -y
conda activate tf_gpu

conda install jupyter notebook matplotlib scipy numpy h5py -y

pip install tensorflow-gpu==2.10.0 keras==2.10.0 tensorflow-estimator==2.10.0 tensorboard==2.10.0 opencv-python pycocotools
```

For converting the model to TensorflowJS, we can create a new environment to keep it simple:
```
conda create -n tfjs python=3.8.12 -y
conda activate tfjs

pip install tensorflowjs==3.19.0
```
and then you can convert it using tensorflowjs_converter in the CLI: `tensorflowjs_converter --input_format=keras --quantize_float16 --weight_shard_size_bytes=50000000 {model} {targetDir}`

---
Stay tuned for more updates as the project progresses!
