#!/bin/bash
# usage: trial_all.sh <dir with 8 module libs> <tag>
ADB="/mnt/f/Android/platform-tools/adb.exe -s BH904YZF9A"; cd /home/h/tmp/SemcCameraUI
$ADB root >/dev/null 2>&1; sleep 2; $ADB remount >/dev/null 2>&1
$ADB push "$(wslpath -w .tmp/shim/new2/libsomc_raisinrsc.so)" /vendor/lib/libsomc_raisinrsc.so >/dev/null 2>&1
$ADB push "$(wslpath -w .tmp/shim/new2/libsomc_alfortrsc.so)" /vendor/lib/libsomc_alfortrsc.so >/dev/null 2>&1
for m in marble melonpan toppo bordeaux canele spica mugichoco yummy; do
  $ADB push "$(wslpath -w $1/libsomc_${m}rsc.so)" /vendor/lib/libsomc_${m}rsc.so >/dev/null 2>&1
done
$ADB shell "chmod 644 /vendor/lib/libsomc_*rsc.so; restorecon /vendor/lib/libsomc_*rsc.so >/dev/null 2>&1"
$ADB reboot; timeout 200 $ADB wait-for-device
for i in $(seq 1 40); do b=$($ADB shell getprop sys.boot_completed 2>/dev/null | tr -d '\r'); [ "$b" = "1" ] && break; sleep 4; done; sleep 15
$ADB shell "rm -f /sdcard/DCIM/100ANDRO/*"
timeout 590 python3 test_camera/test_camera.py -d BH904YZF9A -n 1 -f > .tmp/camera_trial_$2.log 2>&1; echo rc=$?
D=$(ls -dt .tmp/2026* | head -1)
echo "tag=$2 dir=$D errs=$(grep -cE 'RSN_ERR|glError|Ckb apply fail|init error|ERROR' $D/adb_full.log)"
ls -la $D | head -20
