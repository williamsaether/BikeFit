import h5py
import numpy as np
import keras.utils

# PyDataset is the new name https://www.tensorflow.org/api_docs/python/tf/keras/utils/PyDataset
class H5DataGenerator(keras.utils.Sequence):
    def __init__(self, h5_path, batch_size=32):
        self.h5_path = h5_path
        self.batch_size = batch_size

        with h5py.File(self.h5_path, 'r') as f:
            self.dataset_length = f['images'].shape[0]

        self.indices = np.arange(self.dataset_length)

    def __len__(self):
        return int(np.ceil(self.dataset_length / self.batch_size))

    def __getitem__(self, index):
        batch_indices = self.indices[index * self.batch_size:(index + 1) * self.batch_size]

        with h5py.File(self.h5_path, 'r') as f:
            batch_images = f['images'][batch_indices] / 255.0
            batch_heatmaps = f['heatmaps'][batch_indices] / 255.0

        return batch_images, batch_heatmaps