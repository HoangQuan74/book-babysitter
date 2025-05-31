import { Controller } from '@nestjs/common';
import { CountryService } from './country.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller('country')
export class CountryController {
  constructor(private readonly countryService: CountryService) {}

  @MessagePattern({
    cmd: CountryController.prototype.getCountry.name,
  })
  async getCountry() {
    const result = await this.countryService.getCountry();
    return result;
  }

  @MessagePattern({
    cmd: CountryController.prototype.upsertCountry.name,
  })
  async upsertCountry(payload: { countries: any[] }) {
    const { countries } = payload;
    const result = await this.countryService.upsertCountry(countries);
    return result;
  }

  @MessagePattern({
    cmd: CountryController.prototype.getCities.name,
  })
  async getCities(data) {
    const result = await this.countryService.getCities(data);
    return result;
  }
}
