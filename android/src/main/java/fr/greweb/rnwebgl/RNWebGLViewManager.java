package fr.greweb.rnwebgl;

import android.util.Log;
import android.widget.Toast;

import com.facebook.infer.annotation.Assertions;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;

import java.util.Map;

import javax.annotation.Nullable;

public class RNWebGLViewManager extends SimpleViewManager<RNWebGLView> {
  public static final String REACT_CLASS = "RNWebGLView";
  @Override
  public String getName() {
    return REACT_CLASS;
  }
  @Override
  public RNWebGLView createViewInstance(ThemedReactContext context) {
    return new RNWebGLView(context);
  }
  @ReactProp(name = "screenWidth")
  public void setScreenWidth(RNWebGLView view, @Nullable int width) {
    view.setScreenWidth(width);
  }
  @ReactProp(name = "screenHeight")
  public void setScreenHeight(RNWebGLView view, @Nullable int height) {
    view.setScreenHeight(height);
  }
  @Override
  public @Nullable Map getExportedCustomDirectEventTypeConstants() {
    return MapBuilder.of(
            "surfaceCreate",
            MapBuilder.of("registrationName", "onSurfaceCreate")
            );

  }
}
