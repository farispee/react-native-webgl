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

  public static final int COMMAND_SAVE_IMAGE = 1;
  public static final int COMMAND_RESET_IMAGE = 2;

  @Override
  public String getName() {
    return REACT_CLASS;
  }
  public static final int COMMAND_CAPTURE_FRAME = 1;
  @Override
  public RNWebGLView createViewInstance(ThemedReactContext context) {
    return new RNWebGLView(context);
  }

  @Override
  public void receiveCommand( RNWebGLView rnWebGLView ,int commandType, @Nullable ReadableArray args) {
    Assertions.assertNotNull(rnWebGLView);
    Assertions.assertNotNull(args);
    switch (commandType) {
      case COMMAND_CAPTURE_FRAME: {
        rnWebGLView.saveImage();
        return;
      }
      default:
        throw new IllegalArgumentException(String.format(
                "Unsupported command %d received by %s.",
                commandType,
                getClass().getSimpleName()));
    }
  }

  @Override
  public @Nullable Map getExportedCustomDirectEventTypeConstants() {
    return MapBuilder.of(
            "surfaceCreate",
            MapBuilder.of("registrationName", "onSurfaceCreate"),
            "capture",
            MapBuilder.of("registrationName","capture")
            );

  }
  @Override
  public Map<String,Integer> getCommandsMap() {
    return MapBuilder.of(
            "capture",
            COMMAND_CAPTURE_FRAME);
  }
}
