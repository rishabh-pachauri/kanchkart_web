#!/bin/bash
# KanchKart Android Release & Google Play Store Build Helper Script

echo "====================================================="
echo " KanchKart - Google Play Store Release Build Script"
echo " Package ID: com.kanchkart.app"
echo "====================================================="

# Step 1: Generate Keystore if not present
if [ ! -f "android/app/kanchkart-release-key.jks" ]; then
    echo "1. Creating Android Release Keystore..."
    keytool -genkey -v -keystore android/app/kanchkart-release-key.jks \
      -keyalg RSA -keysize 2048 -validity 10000 \
      -alias kanchkart-key \
      -dname "CN=KanchKart, OU=Management, O=KanchKart Firozabad, L=Firozabad, ST=Uttar Pradesh, C=IN" \
      -storepass KanchKartPass2026! -keypass KanchKartPass2026!
    echo "✔ Release Keystore generated."
else
    echo "✔ Release Keystore already exists."
fi

# Step 2: Build Android App Bundle (.aab) for Google Play Store
echo "2. Building Google Play Store Release Bundle (.aab)..."
cd android
./gradlew bundleRelease

echo "====================================================="
echo " SUCCESS! Your Play Store package (.aab) is built:"
echo " File: android/app/build/outputs/bundle/release/app-release.aab"
echo " Upload this file to your Google Play Console at https://play.google.com/console"
echo "====================================================="
