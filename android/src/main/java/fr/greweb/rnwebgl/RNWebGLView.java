package fr.greweb.rnwebgl;

import android.graphics.Bitmap;
import android.graphics.Color;
import android.graphics.PixelFormat;
import android.opengl.EGL14;
import android.opengl.GLSurfaceView;
import android.os.Environment;
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
    public Bitmap imageBitmap;
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
    }
     imageBitmap=  takeScreenshot(unused);

  }
    @ReactMethod
    public void saveImage(){

        //ReactContext reactContext = (ReactContext)getContext();
        //RCTEventEmitter eventEmitter = reactContext.getJSModule(RCTEventEmitter.class);

        saveBitmap(imageBitmap);
        //Toast.makeText(reactContext, "test", Toast.LENGTH_LONG).show();

        //WritableMap response = Arguments.createMap();
        //response.putString("config", "test");
        //eventEmitter.receiveEvent(getId(), "capture", response);
        return;
    }

    private void saveBitmap(Bitmap bitmap) {
        String root = Environment.getExternalStorageDirectory().toString();
        File myDir = new File(root + "/Images");
        myDir.mkdirs();
        Random generator = new Random();
        int n = 10000;
        n = generator.nextInt(n);
        String fname = "Image-" + n + ".jpg";
        File file = new File(myDir, fname);
        if (file.exists()) file.delete();
        try {
            FileOutputStream out = new FileOutputStream(file);
            bitmap.compress(Bitmap.CompressFormat.JPEG, 100, out);
            out.flush();
            out.close();
            Log.i("TAG", "Image SAVED==========" + file.getAbsolutePath());
        } catch (Exception e) {
            e.printStackTrace();
        }

    }
    public Bitmap takeScreenshot(GL10 mGL) {

        final int mWidth = 480;
        final int mHeight =480;
        final int startx=0;
        IntBuffer ib = IntBuffer.allocate(mWidth * mHeight);
        IntBuffer ibt = IntBuffer.allocate(mWidth * mHeight);
        mGL.glReadPixels(0,startx, mWidth, mHeight, GL10.GL_RGBA, GL10.GL_UNSIGNED_BYTE, ib);


        // Convert upside down mirror-reversed image to right-side up normal
        // image.
        for (int i = 0; i < mHeight; i++) {
            for (int j = 0; j < mWidth; j++) {
                ibt.put((mHeight - i - 1) * mWidth + j, ib.get(i * mWidth + j));
            }
        }

        Bitmap mBitmap = Bitmap.createBitmap(mWidth, mHeight, Bitmap.Config.ARGB_8888);
        mBitmap.copyPixelsFromBuffer(ibt);
        return mBitmap;
    }
    public void onSurfaceChanged(GL10 unused, int width, int height) {
  }

    public void onDetachedFromWindow() {
    mGLViewMap.remove(ctxId);
    reactContext.getNativeModule(RNWebGLTextureLoader.class).unloadWithCtxId(ctxId);
    RNWebGLContextDestroy(ctxId);
    super.onDetachedFromWindow();
  }

    public synchronized void runOnGLThread(Runnable r) {
    mEventQueue.add(r);
  }

    public synchronized static void runOnGLThread(int ctxId, Runnable r) {
    RNWebGLView glView = mGLViewMap.get(ctxId);
    if (glView != null) {
      glView.runOnGLThread(r);
    }
  }
    public synchronized static void  capture(int ctxId){

        RNWebGLView glView = mGLViewMap.get(ctxId);
        glView.saveBitmap(glView.imageBitmap);
        return;
    }

}
