import axios from "@/lib/axios";
import type { Asset, AssetType, CreateAssetDto, UpdateAssetDto } from "../types/assetTypes";

export const getAssets = async (typeId?: number | null): Promise<Asset[]> => {
  const params = typeId ? { typeId } : {};
  const { data } = await axios.get("/assets", { params });
  return data;
};

export const getAssetTypes = async (): Promise<AssetType[]> => {
  const { data } = await axios.get("/assets/types");
  return data;
};

export const createAsset = async (data: CreateAssetDto): Promise<Asset> => {
  const { data: response } = await axios.post("/assets", data);
  return response;
};

export const updateAsset = async ({
  id,
  data,
}: {
  id: number;
  data: UpdateAssetDto;
}): Promise<void> => {
  await axios.put(`/assets/${id}`, data);
};

export const deleteAsset = async (id: number): Promise<void> => {
  await axios.delete(`/assets/${id}`);
};