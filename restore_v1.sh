#!/bin/bash
V1_SRC="/Users/JSM/Developer/PCL WEBSITE V1/pcl-erp/frontend/src"
TARGET_DIR="/Users/JSM/Developer/PCL WEBSITE/src/erp"

echo "Restoring V1 CSS, Theme, and Context..."
cp "$V1_SRC/index.css" "$TARGET_DIR/index.css"
cp "$V1_SRC/theme.js" "$TARGET_DIR/theme.js"
cp "$V1_SRC/context/ErpContext.jsx" "$TARGET_DIR/context/ErpContext.jsx"

echo "Restoring V1 Components..."
cp -R "$V1_SRC/components/"* "$TARGET_DIR/components/"

echo "Done."
