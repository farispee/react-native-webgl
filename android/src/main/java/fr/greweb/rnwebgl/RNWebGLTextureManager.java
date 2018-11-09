package fr.greweb.rnwebgl;

import android.widget.Toast;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;

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
    public void capture(final int objId) {
        RNWebGLTexture obj= this.getReactApplicationContext().getNativeModule(RNWebGLTextureLoader.class).getRNWebGLTexture(objId1);
        if(obj==null){
            Toast.makeText(getReactApplicationContext(), "obj is null > objID"+objId1, Toast.LENGTH_LONG).show();
        }
        else{
            obj.capture();
            //Toast.makeText(getReactApplicationContext(), "captured", Toast.LENGTH_LONG).show();

        }

    }

    @ReactMethod
    public void destroy(final int objId) {
        this.getReactApplicationContext().getNativeModule(RNWebGLTextureLoader.class).unloadWithObjId(objId);
        Toast.makeText(getReactApplicationContext(), "objId "+objId, Toast.LENGTH_LONG).show();

    }
}
