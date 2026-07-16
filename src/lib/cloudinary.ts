import { v2 as cloudinary } from "cloudinary";
import { env, requireServerEnv } from "@/lib/env";

export function configureCloudinary() {
  cloudinary.config({
    cloud_name: requireServerEnv("cloudinaryCloudName"),
    api_key: requireServerEnv("cloudinaryApiKey"),
    api_secret: requireServerEnv("cloudinaryApiSecret")
  });
  return cloudinary;
}

export function signedUploadParams(folder: string, publicId?: string) {
  const client = configureCloudinary();
  const timestamp = Math.round(Date.now() / 1000);
  const params = {
    timestamp,
    folder: `${env.cloudinaryUploadFolder}/${folder}`.replace(/\/+/g, "/"),
    ...(publicId ? { public_id: publicId } : {})
  };

  return {
    ...params,
    cloudName: env.cloudinaryCloudName,
    apiKey: env.cloudinaryApiKey,
    signature: client.utils.api_sign_request(params, requireServerEnv("cloudinaryApiSecret"))
  };
}

