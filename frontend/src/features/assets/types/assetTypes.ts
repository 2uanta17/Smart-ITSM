export interface Asset {
  id: number;
  assetTag: string;
  name: string;
  serialNum: string;
  status: string;
  typeId: number;
  typeName: string;
  assignedUserId?: number | null;
  assignedUserName?: string | null;
}

export interface AssetType {
  id: number;
  name: string;
}

export interface CreateAssetDto {
  assetTag: string;
  name: string;
  serialNum: string;
  typeId: number;
  assignedUserId?: number | null;
}

export interface UpdateAssetDto {
  name: string;
  serialNum: string;
  typeId: number;
  assignedUserId?: number | null;
}