#!/bin/bash
ADB="/mnt/f/Android/platform-tools/adb.exe -s BH904YZF9A"; cd /home/h/tmp/SemcCameraUI/.tmp/lineage_phone/newgpu_backup
$ADB root >/dev/null 2>&1; sleep 2; $ADB remount >/dev/null 2>&1
for f in libC2D2.so libCB.so libOpenCL.so libadreno_utils.so libc2d30_bltlib.so libgsl.so libllvm-glnext.so libllvm-qcom.so librs_adreno.so; do
  $ADB push "$(wslpath -w $PWD/$f)" /vendor/lib/$f >/dev/null 2>&1
done
for f in egl/*; do $ADB push "$(wslpath -w $PWD/$f)" /vendor/lib/$f >/dev/null 2>&1; done
$ADB shell "chmod 644 /vendor/lib/*.so /vendor/lib/egl/*.so; restorecon -R /vendor/lib >/dev/null 2>&1"
$ADB reboot; timeout 200 $ADB wait-for-device
for i in $(seq 1 40); do b=$($ADB shell getprop sys.boot_completed 2>/dev/null | tr -d '\r'); [ "$b" = "1" ] && break; sleep 4; done; sleep 10
$ADB root >/dev/null 2>&1; sleep 3
$ADB shell 'md5sum /vendor/lib/libgsl.so /vendor/lib/egl/libGLESv2_adreno.so; dumpsys SurfaceFlinger 2>/dev/null | grep -i "GLES:" | head -2' | tr -d '\r'
