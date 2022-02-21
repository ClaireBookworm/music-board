import numpy as np
import pandas as pd
import scanpy as sc

sc.settings.verbosity = 3             # verbosity: errors (0), warnings (1), info (2), hints (3)
sc.logging.print_header()
sc.settings.set_figure_params(dpi=80, facecolor='white')

results_file = 'write/pbmc3k.h5ad'  # the file that will store the analysis results
# ^ h5ad is HDF5 based file format

# adada is an annData object
adata = sc.read_10x_mtx(
    'data/filtered_gene_bc_matrices/hg19/',  # the directory with the `.mtx` file
    var_names='gene_symbols',   # use gene symbols for the variable names (variables-axis index)
    cache=True)  # cache file for faster subsequent reading

adata.var_names_make_unique() # this is unnecessary if using the `var_names='gene_ids'` option in sc.red_10x_mts

adata

sc.ply.highest_expr_genes(adata, n_top=20)
# show those genes taht yield the highest fraction of counts in each single cell

