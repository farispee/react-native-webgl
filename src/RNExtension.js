//@flow
import { NativeModules } from "react-native";
import { RNWebGLTexture } from "./webglTypes";
const { RNWebGLTextureManager } = NativeModules;

type RNWebGLRenderingContext = WebGLRenderingContext & {
  __endFrame: *,
  __readPixelsToTemporaryFile: *
};

type Config = Object;
export type Extension = {
  // NB more methods can be extended with middlewares
  loadTexture: (
    config: Config
  ) => Promise<{ texture: RNWebGLTexture, width: number, height: number }>,
  unloadTexture: (texture: RNWebGLTexture) => void,
  capture: (texture: RNWebGLTexture) => object,
  endFrame: () => void
};

type Middleware = (extIn: Extension) => Extension;

const middlewares: Array<Middleware> = [];

export default {
  addMiddleware: (middleware: Middleware) => {
    middlewares.push(middleware);
  },
  createWithContext: (gl: RNWebGLRenderingContext, ctxId: number): Extension =>
    middlewares.reduce((ext, middleware) => middleware(ext), {
      loadTexture: config =>
        RNWebGLTextureManager.create({
          ...config,
          ctxId
        }).then(({ objId, width, height }) => {
          const texture = new RNWebGLTexture(objId);
          return { texture, width, height };
        }),
      unloadTexture: texture => RNWebGLTextureManager.destroy(texture.id),
      capture:async (texture,location)=>{ 
        return await RNWebGLTextureManager.capture(ctxId,texture.id,location)
        .then(({ url,width,height,ratio }) => {
        return {url,width,height,ratio };
      });  
    },//actually texture & ctxId not using but in android code
      endFrame: gl.__endFrame.bind(gl)
    })
};
