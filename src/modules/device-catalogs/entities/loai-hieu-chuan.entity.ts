import { Entity } from "typeorm";
import { CatalogEntity } from "./catalog.entity";

@Entity("loai_hieu_chuans")
export class LoaiHieuChuan extends CatalogEntity {}
