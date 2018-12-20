package fr.greweb.rnwebgl;

import android.Manifest;
import android.content.ContentResolver;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Matrix;
import android.graphics.Paint;
import android.graphics.PixelFormat;
import android.graphics.PorterDuff;
import android.graphics.PorterDuffXfermode;
import android.net.Uri;
import android.opengl.EGL14;
import android.opengl.GLSurfaceView;
import android.os.Environment;
import android.provider.MediaStore;
import android.support.v4.content.ContextCompat;
import android.util.DisplayMetrics;
import android.util.Log;
import android.util.SparseArray;
import android.widget.Toast;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.UIManagerModule;
import com.facebook.react.uimanager.events.EventDispatcher;
import com.facebook.react.uimanager.events.RCTEventEmitter;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.IntBuffer;
import java.util.Random;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.logging.Logger;

import javax.microedition.khronos.egl.EGLConfig;
import javax.microedition.khronos.opengles.GL10;

import static fr.greweb.rnwebgl.RNWebGL.*;

public class RNWebGLView extends GLSurfaceView implements GLSurfaceView.Renderer {
    private boolean onSurfaceCreateCalled = false;
    private int ctxId = -1;
       int width;
      int height;
      float imgRatio;
      boolean isRedraw=true;

    public IntBuffer intBuffer;
    public boolean captured=false;

    private ThemedReactContext reactContext;

      public RNWebGLView(ThemedReactContext context) {
       super(context);
       reactContext = context;

        setEGLContextClientVersion(2);
        setEGLConfigChooser(8, 8, 8, 8, 16, 0);
        getHolder().setFormat(PixelFormat.TRANSLUCENT);
        setRenderer(this);
  }

    private static SparseArray<RNWebGLView> mGLViewMap = new SparseArray<>();
    private ConcurrentLinkedQueue<Runnable> mEventQueue = new ConcurrentLinkedQueue<>();

    public void onSurfaceCreated(GL10 unused, EGLConfig config) {

        EGL14.eglSurfaceAttrib(EGL14.eglGetCurrentDisplay(), EGL14.eglGetCurrentSurface(EGL14.EGL_DRAW),
            EGL14.EGL_SWAP_BEHAVIOR, EGL14.EGL_BUFFER_PRESERVED);

    final RNWebGLView glView = this;
    if (!onSurfaceCreateCalled) {
      // On JS thread, get JavaScriptCore context, create RNWebGL context, call JS callback
      final ReactContext reactContext = (ReactContext) getContext();
      reactContext.runOnJSQueueThread(new Runnable() {
        @Override
        public void run() {
          ctxId = RNWebGLContextCreate(reactContext.getJavaScriptContextHolder().get());
          mGLViewMap.put(ctxId, glView);
          WritableMap arg = Arguments.createMap();
          arg.putInt("ctxId", ctxId);
          reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(getId(), "surfaceCreate", arg);
        }
      });
      onSurfaceCreateCalled = true;
    }

  }

    public synchronized void onDrawFrame(GL10 unused) {
    // Flush any queued events
    for (Runnable r : mEventQueue) {
      r.run();
    }
    mEventQueue.clear();

    // ctxId may be unset if we get here (on the GL thread) before RNWebGLContextCreate(...) is
    // called on the JS thread to create the RNWebGL context and save its id (see above in
    // the implementation of `onSurfaceCreated(...)`)
    if (ctxId > 0) {
      RNWebGLContextFlush(ctxId);
        if(this.width>0&&this.height>0)
        {
            intBuffer=  glReadPixels(unused);
        }
    }

  }
    private IntBuffer glReadPixels(GL10 mGL) {
        final int mWidth = this.width;
        final int mHeight =this.height;
        final int startx=0;
        IntBuffer ib = IntBuffer.allocate(mWidth * mHeight);
        mGL.glReadPixels(0,startx, mWidth, mHeight, GL10.GL_RGBA, GL10.GL_UNSIGNED_BYTE, ib);
        return ib;
    }
    private WritableMap saveBitmap(IntBuffer intBuffer,String location) {
        Bitmap bitmap=takeScreenshot(intBuffer);
        ////String root = Environment.getExternalStorageDirectory().toString();
        //File myDir = new File(root + "/Images");
        //myDir.mkdirs();
        //Random generator = new Random();
        //int n = 10;
        //n = generator.nextInt(n);
        //String fname = "Image-" + n + ".jpg";
        //File file = new File(myDir, fname);
        //File file= new File( Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES),fname);
        File file= new File(location);
        if (file.exists())
        {
            //deleteFileFromMediaStore(this.getContext().getContentResolver(),file);
            //file.delete();
        }
        try {
            FileOutputStream out = new FileOutputStream(file);
            bitmap.compress(Bitmap.CompressFormat.JPEG, 100, out);
            out.flush();
            out.close();
            Log.i("TAG", "Image SAVED==========" + file.getAbsolutePath());
            WritableMap response = Arguments.createMap();
            response.putString("url", file.getAbsolutePath());
            response.putInt("width", bitmap.getWidth());
            response.putInt("height",  bitmap.getHeight());
            response.putDouble("ratio",  this.imgRatio);
            return response;
        } catch (Exception e) {

            e.printStackTrace();
            WritableMap response = Arguments.createMap();
            response.putString("url", e.getMessage());
            response.putInt("width", 0);
            response.putInt("height", 0);
            response.putDouble("ratio",  0);

            return response;
        }
    }
    public  void deleteFileFromMediaStore(final ContentResolver contentResolver, final File file) {
        String canonicalPath;
        try {
            canonicalPath = file.getCanonicalPath();
        } catch (IOException e) {
            canonicalPath = file.getAbsolutePath();
        }
        final Uri uri = MediaStore.Files.getContentUri("external");
        final int result = contentResolver.delete(uri,
                MediaStore.Files.FileColumns.DATA + "=?", new String[] {canonicalPath});
        if (result == 0) {
            final String absolutePath = file.getAbsolutePath();
            if (!absolutePath.equals(canonicalPath)) {
                contentResolver.delete(uri,
                        MediaStore.Files.FileColumns.DATA + "=?", new String[]{absolutePath});
            }
        }
    }
    private Bitmap takeScreenshot(IntBuffer ib) {

        final int mWidth =this.width;
        final int mHeight =this.height;
        IntBuffer ibt = IntBuffer.allocate(mWidth * mHeight);
        for (int i = 0; i < mHeight; i++) {
            for (int j = 0; j < mWidth; j++) {
                ibt.put((mHeight - i - 1) * mWidth + j, ib.get(i * mWidth + j));
            }
        }
        //Bitmap mBitmap = Bitmap.createBitmap(mWidth, mHeight, Bitmap.Config.ARGB_8888);
        Bitmap bmOverlay = Bitmap.createBitmap(mWidth, mHeight, Bitmap.Config.ARGB_8888);
        bmOverlay.copyPixelsFromBuffer(ibt);
        //Canvas canvas = new Canvas(bmOverlay);
       // canvas.drawBitmap(mBitmap, 0, 0, null);
        return bmOverlay;
    }
    public void onSurfaceChanged(GL10 unused, int width, int height) {
  }

    public void onDetachedFromWindow() {
    mGLViewMap.remove(ctxId);
    reactContext.getNativeModule(RNWebGLTextureLoader.class).unloadWithCtxId(ctxId);
    RNWebGLContextDestroy(ctxId);
    super.onDetachedFromWindow();
  }
    double x=0;
    double y=0;
    public synchronized void runOnGLThread(Runnable r,int width, int height) {

        if (this.isRedraw) {
            this.isRedraw=false;
            this.imgRatio = ((float) width / (float) height);
        }
        DisplayMetrics mat = getContext().getResources().getDisplayMetrics();
        float ratio = this.imgRatio;
        float w = 0;
        if (ratio >= 1) {
            w = mat.widthPixels;
        } else {

            w = mat.widthPixels * ratio - (1.5f - mat.density) * 52f-20;
        }
        float h = (w / ratio);
        this.width = Math.round(w)-10;
        this.height = Math.round(h)-10;
        mEventQueue.add(r);
    }

    public synchronized static void runOnGLThread(int ctxId,int width,int height, Runnable r) {
    RNWebGLView glView = mGLViewMap.get(ctxId);
    if (glView != null) {
      glView.runOnGLThread(r,width,height);
    }
  }
    public void setImgRatio(final float value) {
        if (value > 0) {
            this.imgRatio = value;
            this.isRedraw = true;
        }
    }


    public synchronized static WritableMap  capture(int ctxId,String location){
        RNWebGLView glView = mGLViewMap.get(ctxId);
        WritableMap out=  glView.saveBitmap(glView.intBuffer,location);
        return out;
    }

}
