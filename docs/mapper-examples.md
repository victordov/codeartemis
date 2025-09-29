# Mapper Examples

This document provides examples of how to create data mappers for handling differences between OpenAPI specifications.

## Basic Field Mapping

When fields have different names between specifications, use simple field mappers:

```typescript
export const fieldMapper = {
  // Map 'user_id' to 'userId'
  mapUserId: (data: any) => {
    if (data.user_id !== undefined) {
      data.userId = data.user_id;
      delete data.user_id;
    }
    return data;
  },

  // Map 'full_name' to separate 'firstName' and 'lastName'
  mapFullName: (data: any) => {
    if (data.full_name) {
      const nameParts = data.full_name.split(' ');
      data.firstName = nameParts[0] || '';
      data.lastName = nameParts.slice(1).join(' ') || '';
      delete data.full_name;
    }
    return data;
  }
};
```

## Type Conversion Mappers

Handle different data types between specifications:

```typescript
export const typeMappers = {
  // Convert string dates to Date objects
  mapDateFields: (data: any) => {
    const dateFields = ['createdAt', 'updatedAt', 'dateOfBirth'];
    dateFields.forEach(field => {
      if (data[field] && typeof data[field] === 'string') {
        data[field] = new Date(data[field]);
      }
    });
    return data;
  },

  // Convert boolean strings to actual booleans
  mapBooleanFields: (data: any) => {
    const boolFields = ['isActive', 'isVerified'];
    boolFields.forEach(field => {
      if (data[field] !== undefined) {
        data[field] = data[field] === 'true' || data[field] === true;
      }
    });
    return data;
  }
};
```

## Nested Object Mappers

Handle nested objects and array transformations:

```typescript
export const nestedMappers = {
  // Map nested address object
  mapAddress: (data: any) => {
    if (data.address_info) {
      data.address = {
        street: data.address_info.street_address,
        city: data.address_info.city_name,
        state: data.address_info.state_code,
        zipCode: data.address_info.postal_code,
        country: data.address_info.country_code
      };
      delete data.address_info;
    }
    return data;
  },

  // Map array of phone numbers
  mapPhoneNumbers: (data: any) => {
    if (data.phone_numbers && Array.isArray(data.phone_numbers)) {
      data.phoneNumbers = data.phone_numbers.map((phone: any) => ({
        type: phone.phone_type,
        number: phone.phone_number,
        isPrimary: phone.is_primary === 'true'
      }));
      delete data.phone_numbers;
    }
    return data;
  }
};
```

## Response Structure Mappers

Transform response structures to match expected format:

```typescript
export const responseMappers = {
  // Transform paginated response
  mapPaginatedResponse: (response: any) => {
    if (response.data && response.meta) {
      return {
        users: response.data,
        total: response.meta.total_count,
        pagination: {
          limit: response.meta.per_page,
          offset: response.meta.current_page * response.meta.per_page,
          total: response.meta.total_count,
          hasMore: response.meta.current_page < response.meta.total_pages
        }
      };
    }
    return response;
  },

  // Transform error response
  mapErrorResponse: (response: any) => {
    if (response.error_code || response.error_message) {
      return {
        code: response.error_code || 'UNKNOWN_ERROR',
        message: response.error_message || 'An unknown error occurred',
        details: response.error_details || {}
      };
    }
    return response;
  }
};
```

## Validation and Default Mappers

Add validation and default values:

```typescript
export const validationMappers = {
  // Add default values for missing fields
  addDefaults: (data: any) => {
    return {
      isActive: true,
      createdAt: new Date().toISOString(),
      ...data
    };
  },

  // Validate and sanitize email
  sanitizeEmail: (data: any) => {
    if (data.email) {
      data.email = data.email.toLowerCase().trim();
      // Basic email validation
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        throw new Error('Invalid email format');
      }
    }
    return data;
  }
};
```

## Usage Example

Here's how to combine multiple mappers:

```typescript
export function applyAllMappers(data: any, mapperType: 'user' | 'response' = 'user') {
  let mappedData = { ...data };

  if (mapperType === 'user') {
    // Apply field mappers
    mappedData = fieldMapper.mapUserId(mappedData);
    mappedData = fieldMapper.mapFullName(mappedData);
    
    // Apply type mappers
    mappedData = typeMappers.mapDateFields(mappedData);
    mappedData = typeMappers.mapBooleanFields(mappedData);
    
    // Apply nested mappers
    mappedData = nestedMappers.mapAddress(mappedData);
    mappedData = nestedMappers.mapPhoneNumbers(mappedData);
    
    // Apply validation mappers
    mappedData = validationMappers.addDefaults(mappedData);
    mappedData = validationMappers.sanitizeEmail(mappedData);
  } else if (mapperType === 'response') {
    mappedData = responseMappers.mapPaginatedResponse(mappedData);
  }

  return mappedData;
}
```