#!/bin/bash
cd frontend && npm install && npm run build
rm -rf ../backend/public/*
cp -r build/* ../backend/public/
cd ../backend && npm install
