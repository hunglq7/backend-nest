import { Entity } from "typeorm";
import { CatalogEntity } from "./catalog.entity";

@Entity("loai_kiem_dinhs")
export class LoaiKiemDinh extends CatalogEntity {}
