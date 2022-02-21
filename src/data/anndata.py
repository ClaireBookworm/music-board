import numpy as np
import pandas as pd
import anndata as ad
# print(ad.__version__) 

n_obs, n_vars = 10000, 10
X = np.random.random((n_obs, n_vars))
# number of obseravations (samples) and number of vars (features)
# this creates a data matrix 

df = pd.DataFrame(X, columns=list('ABCDEFGHIJ'), index=np.arange(n_obs, dtype=int).astype(str))
df.head() # creates and prints a dataframe

# this creates a __pycache__ -> anndata.cypthon-39.pyc