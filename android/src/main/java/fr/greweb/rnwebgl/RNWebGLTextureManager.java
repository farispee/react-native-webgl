package fr.greweb.rnwebgl;

import android.widget.Toast;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.uimanager.events.RCTEventEmitter;

import java.util.Map;

import static java.security.AccessController.getContext;

public class RNWebGLTextureManager extends ReactContextBaseJavaModule {
    @Override
    public String getName() {
        return "RNWebGLTextureManager";
    }

    public RNWebGLTextureManager(ReactApplicationContext reactContext) {
        super(reactContext);
    }
     int objId1=0;
    @ReactMethod
    public void create(final ReadableMap config, final Promise promise) {

        this.getReactApplicationContext()
                .getNativeModule(RNWebGLTextureLoader.class)
                .loadWithConfigAndWaitAttached(config, new RNWebGLTextureCompletionBlock() {
            public void call(Exception e, RNWebGLTexture obj) {
                if (e != null) {
                    promise.reject(e);
                }
                else {
                    WritableMap response = Arguments.createMap();
                    response.putInt("objId", obj.objId);
                    response.putInt("width", obj.width);
                    response.putInt("height", obj.height);
                    objId1=obj.objId;
                    android.util.Log.i("RNWebGL", obj.objId+" of size "+obj.width+"x"+obj.height);
                    promise.resolve(response);

                }

            }
        });
    }

    @ReactMethod
    public void capture(final int ctxId,final int objId,final String location, final Promise promise) {

        if(objId==0){
           WritableMap response = Arguments.createMap();
           response.putString("url", "");
           response.putInt("width", 0);
           response.putInt("height",  0);
           response.putDouble("ratio", 0);
           promise.resolve(response);
       }
       else{
        RNWebGLTexture obj= this.getReactApplicationContext().getNativeModule(RNWebGLTextureLoader.class).getRNWebGLTexture(objId);
        if(obj!=null) {
            WritableMap response = obj.capture(ctxId,location);
            promise.resolve(response);
        }
       }
    }

    @ReactMethod
    public void destroy(final int objId) {
        this.getReactApplicationContext().getNativeModule(RNWebGLTextureLoader.class).unloadWithObjId(objId);
    }
}
